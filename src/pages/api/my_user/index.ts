import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { z } from "zod";
import {
  LikeOrDislike,
  Sex,
  UserGameType,
  UserStrongArea,
} from "@prisma/client";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { deleteFile, generateReadSignedUrl } from "@/libs/cloudStorage";
import { User as UserInDb } from "@prisma/client";
import { UserDetail } from "@/types/user";
import { getCookie, setCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";
import { getZodFormattedErrors } from "@/utils/getZodFormattedErrors";
import { cookieOptions } from "@/constants/cookieOptions";

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
        const userId = getCookie("userId", { req, res });
        if (!user || user.id !== userId) {
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
          include: { userGameTypes: true, userStrongAreas: true },
        });
        const userId = getCookie("userId", { req, res });
        if (!user || user.id !== userId) {
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
  myUser: UserDetail;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetMyUserResponseSuccessBody | ResponseErrorBody>,
  userId: string
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      userGameTypes: { include: { gameType: true } },
      userStrongAreas: { include: { strongArea: true } },
    },
  });

  res.status(200).json({
    myUser: {
      id: user.id,
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
        id: ugt.id,
        gameType: { id: ugt.gameType.id, name: ugt.gameType.name },
        likeOrDislike: ugt.likeOrDislike,
      })),
      userStrongAreas: user.userStrongAreas.map((usa) => ({
        id: usa.id,
        strongArea: { id: usa.strongArea.id, name: usa.strongArea.name },
      })),
    },
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

  const userData = validation.data.user;
  const user = await prisma.user.create({
    data: { ...userData, fbUid },
  });

  setCookie("userId", user.id, { req, res, ...cookieOptions });

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
  strongAreaIds: string[];
};

export type PatchMyUserResponseSuccessBody = "";

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PatchMyUserResponseSuccessBody | ResponseErrorBody>,
  user: UserInDb & {
    userGameTypes: UserGameType[];
    userStrongAreas: UserStrongArea[];
  }
) => {
  const rawParams: PatchMyUserRequestBody = req.body;

  // バリデーション
  const schema = z.object({
    user: z.object({
      name: z.string().min(1).max(20),
      iconImageFileKey: z.string().optional(),
      sex: z.nativeEnum(Sex).optional(),
      age: z.number().optional(),
      startedAt: z.string().optional(), // TODO: date型にすること
      description: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
    }),
    userGameTypes: z
      .object({
        gameTypeId: z.string(),
        likeOrDislike: z.nativeEnum(LikeOrDislike),
      })
      .array(),
    strongAreaIds: z.string().array(),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(422).json({ errors: getZodFormattedErrors(validation) });

  // requrestにiconImageFileKeyが存在して、DBにuser.iconImageFileKeyが存在する時、古いiconImageFileを削除
  if (validation.data.user.iconImageFileKey) {
    const userIdDb = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    if (userIdDb.iconImageFileKey) await deleteFile(userIdDb.iconImageFileKey);
  }

  // 更新
  const userData = validation.data.user;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: userData.name,
      sex: userData.sex ?? null,
      age: userData.age ?? null,
      startedAt: userData.startedAt ? userData.startedAt : null,
      description: userData.description || null,
      twitter: userData.twitter || null,
      instagram: userData.instagram || null,
      iconImageFileKey: userData.iconImageFileKey ?? null,
    },
  });

  // TODO: 一旦全て消す、後々更新に切り替えること
  for (const egtId of user.userGameTypes.map((ugt) => ugt.id)) {
    await prisma.userGameType.delete({
      where: { id: egtId },
    });
  }
  const userGameTypes = validation.data.userGameTypes;
  for (const userGameType of userGameTypes) {
    await prisma.userGameType.create({
      data: {
        userId: user.id,
        gameTypeId: userGameType.gameTypeId,
        likeOrDislike: userGameType.likeOrDislike,
      },
    });
  }

  // TODO: 一旦全て消す、後々更新に切り替えること
  for (const usa of user.userStrongAreas) {
    await prisma.userStrongArea.delete({
      where: { id: usa.id },
    });
  }
  const strongAreaIdsData = validation.data.strongAreaIds;
  for (const strongAreaId of strongAreaIdsData) {
    await prisma.userStrongArea.create({
      data: {
        userId: user.id,
        strongAreaId: strongAreaId,
      },
    });
  }

  res.status(200).end();
};
