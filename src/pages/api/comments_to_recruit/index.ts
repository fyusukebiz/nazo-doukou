import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { User } from "@prisma/client";
import { getCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";

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

  if (!fbUser.emailVerified) {
    return res.status(401).json({ error: "メール認証が未完了です" });
  }

  const user = await prisma.user.findUnique({ where: { fbUid } });
  const userId = getCookie("userId", { req, res });
  if (!user || user.id !== userId) {
    return res.status(401).json({ error: "再ログインしてください。" });
  }

  try {
    switch (req.method) {
      case "POST":
        await postHandler(req, res, user);
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

// POST request
export type PostCommentToRecruitRequestBody = {
  commentToRecruit: {
    recruitId: string;
    message: string;
  };
};
export type PostCommentToRecruitResponseSuccessBody = "";

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    PostCommentToRecruitResponseSuccessBody | ResponseErrorBody
  >,
  user: User
) => {
  const rawParams: PostCommentToRecruitRequestBody = req.body;

  const schema = z.object({
    commentToRecruit: z.object({
      recruitId: z.string(),
      message: z.string(),
    }),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const commentData = validation.data.commentToRecruit;
  await prisma.commentToRecruit.create({
    data: { ...commentData, userId: user.id },
  });

  res.status(200).end();
};
