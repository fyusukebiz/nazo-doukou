import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { z } from "zod";
import { Sex } from "@prisma/client";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { deleteFile, generateReadSignedUrl } from "@/libs/cloudStorage";
import { User } from "@prisma/client";
import { getCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";
import { getZodFormattedErrors } from "@/utils/getZodFormattedErrors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const currentFbUserIdToken = getCookie("currentFbUserIdToken", { req, res });

  if (!currentFbUserIdToken) {
    return res.status(401).json({ error: "ログインしてください" });
  }

  const fbAuthRes = await verifyIdToken(currentFbUserIdToken);
  if (!fbAuthRes.ok) {
    return res.status(401).json({ error: "再ログインしてください。" });
  }
  const data = await fbAuthRes.json();
  const fbUser = data.users[0];
  const fbUid = fbUser.localId;

  try {
    switch (req.method) {
      case "GET": {
        const user = await prisma.user.findUnique({ where: { fbUid } });
        if (!user) {
          return res.status(401).json({ error: "再ログインしてください。" });
        }

        await getHandler(req, res, user.id);
        break;
      }
      case "POST":
        await postHandler(req, res, fbUid);
        break;

      case "PATCH": {
        const user = await prisma.user.findUnique({
          where: { fbUid: fbUid },
        });
        if (!user) {
          return res.status(401).json({ error: "再ログインしてください。" });
        }

        await patchHandler(req, res, user);
        break;
      }

      default:
        res.status(405).end(`Not Allowed`);
        break;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "エラーが発生しました" });
  }
}

// GET request
export type GetMyUserResponseSuccessBody = {
  name: string;
  iconImageUrl?: string;
  sex?: Sex;
  age?: number;
  startedAt?: string;
  description?: string;
  twitter?: string;
  instagram?: string;
  userGameTypes: {
    gameTypeId: string;
    likeOrDislike: "LIKE" | "DISLIKE";
  }[];
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetMyUserResponseSuccessBody | ResponseErrorBody>,
  userId: string
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { userGameTypes: true },
  });

  res.status(200).json({
    name: user.name || "名無しさん",
    ...(user.iconImageFileKey && {
      iconImageUrl: await generateReadSignedUrl(user.iconImageFileKey),
    }),
    ...(user.sex && { sex: user.sex }),
    ...(user.age && { age: user.age }),
    ...(user.startedAt && { startedAt: user.startedAt.toISOString() }),
    ...(user.description && { description: user.description }),
    ...(user.twitter && { twitter: user.twitter }),
    ...(user.instagram && { instagram: user.instagram }),
    userGameTypes: user.userGameTypes.map((ugt) => ({
      gameTypeId: ugt.gameTypeId,
      likeOrDislike: ugt.likeOrDislike,
    })),
  });
};

// POST request
export type PostMyUserRequestBody = {
  user: {
    name: string;
  };
};
export type PostMyUserResponseSuccessBody = "";

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PostMyUserResponseSuccessBody | ResponseErrorBody>,
  fbUid: string
) => {
  const rawParams: PostMyUserResponseSuccessBody = req.body;

  // 重複チェック
  const duplicated = await prisma.user.findUnique({ where: { fbUid } });
  if (!!duplicated) return res.status(409).json({ error: "登録ずみです" });

  const schema = z.object({
    user: z.object({
      name: z.string().min(1).max(255),
    }),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(422).json({ errors: getZodFormattedErrors(validation) });

  const user = validation.data.user;
  await prisma.user.create({
    data: { ...user, fbUid },
  });

  res.status(200).end();
};

// PATCH request
export type PatchMyUserRequestBody = {
  user: {
    name: string;
    iconImageFileKey?: string;
    sex?: Sex;
    age?: number;
    startedAt?: string;
    description?: string;
    twitter?: string;
    instagram?: string;
  };
  userGameTypes: {
    gameTypeId: string;
    likeOrDislike: "LIKE" | "DISLIKE";
  }[];
};

export type PatchMyUserResponseSuccessBody = "";

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PatchMyUserResponseSuccessBody | ResponseErrorBody>,
  user: User
) => {
  const rawParams: PatchMyUserRequestBody = req.body;

  // バリデーション
  const schema = z.object({
    user: z.object({
      name: z.string().min(1).max(255),
      iconImageFileKey: z.string().optional(),
      sex: z.union([z.literal("MALE"), z.literal("FEMALE")]).optional(),
      age: z.number().optional(),
      startedAt: z.date().optional(),
      description: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
    }),
    userGameTypes: z
      .object({
        gameTypeId: z.string(),
        likeOrDislike: z.union([z.literal("LIKE"), z.literal("DISLIKE")]),
      })
      .array(),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  // requrestにiconImageFileKeyが存在して、DBにuser.iconImageFileKeyが存在する時、古いiconImageFileを削除
  if (validation.data.user.iconImageFileKey) {
    const userIdDb = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    if (userIdDb.iconImageFileKey) await deleteFile(userIdDb.iconImageFileKey);
  }

  // 更新
  await prisma.user.update({
    where: { id: user.id },
    data: validation.data.user, // TODO startedAtはDate型にしなくても大丈夫？
  });

  for (const userGameType of validation.data.userGameTypes) {
    await prisma.userGameType.upsert({
      where: {
        userId_gameTypeId: {
          userId: user.id,
          gameTypeId: userGameType.gameTypeId,
        },
      },
      update: {
        likeOrDislike: userGameType.likeOrDislike,
      },
      create: {
        userId: user.id,
        gameTypeId: userGameType.gameTypeId,
        likeOrDislike: userGameType.likeOrDislike,
      },
    });
  }

  res.status(200).end();
};
