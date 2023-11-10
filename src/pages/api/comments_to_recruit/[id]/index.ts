import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
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
      case "DELETE":
        await deleteHandler(req, res, user);
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

// DELETE request
export type DeleteCommentToRecruitResponseSuccessBody = "";

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    DeleteCommentToRecruitResponseSuccessBody | ResponseErrorBody
  >,
  user: User
) => {
  const commentToRecruitId = req.query.id as string | undefined;
  if (!commentToRecruitId)
    return res.status(404).json({ error: "投稿がありません" });

  // 投稿した本人以外削除不可
  const commentToRecruit = await prisma.commentToRecruit.findUnique({
    where: { id: commentToRecruitId },
  });
  if (commentToRecruit?.userId !== user.id)
    return res.status(403).json({ error: "権限がありません" });

  await prisma.commentToRecruit.delete({
    where: { id: commentToRecruitId },
  });

  res.status(200).end();
};
