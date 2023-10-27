import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { z } from "zod";
import { SessionUser } from "@/types/next-auth";
import { Sex } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { ErrorResponse } from "@/types/errorResponse";
import { deleteFile, generateReadSignedUrl } from "@/libs/cloudStorage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ error: "ログインしてください" });

  const user = session.user;

  try {
    switch (req.method) {
      case "GET":
        await getHandler(req, res, user);
        break;

      case "PATCH":
        await patchHandler(req, res, user);
        break;

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
export type GetMyUserResponseBody =
  | {
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
    }
  | ErrorResponse;

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetMyUserResponseBody>,
  sessionUser: SessionUser
) => {
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { userGameTypes: true },
  });
  if (!user) return res.status(404).json({ error: "ユーザーがいません" });

  const fileKey = uuidv4();

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

export type PatchMyUserResponseBody = "" | ErrorResponse;

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PatchMyUserResponseBody>,
  sessionUser: SessionUser
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
      where: { id: sessionUser.id },
    });
    if (userIdDb.iconImageFileKey) await deleteFile(userIdDb.iconImageFileKey);
  }

  // 更新
  await prisma.user.update({
    where: { id: sessionUser.id },
    data: validation.data.user, // TODO startedAtはDate型にしなくても大丈夫？
  });

  for (const userGameType of validation.data.userGameTypes) {
    await prisma.userGameType.upsert({
      where: {
        userId_gameTypeId: {
          userId: sessionUser.id,
          gameTypeId: userGameType.gameTypeId,
        },
      },
      update: {
        likeOrDislike: userGameType.likeOrDislike,
      },
      create: {
        userId: sessionUser.id,
        gameTypeId: userGameType.gameTypeId,
        likeOrDislike: userGameType.likeOrDislike,
      },
    });
  }

  res.status(200).end();
};
