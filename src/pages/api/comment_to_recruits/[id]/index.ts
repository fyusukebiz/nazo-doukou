import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { SessionUser } from "@/types/next-auth";
import { ErrorResponse } from "@/types/errorResponse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  try {
    switch (req.method) {
      case "DELETE":
        if (!session)
          return res.status(401).json({ error: "ログインしてください" });

        await deleteHandler(req, res, session.user);
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
export type DeleteCommentToRecruitResponseBody = "" | ErrorResponse;

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<DeleteCommentToRecruitResponseBody>,
  sessionUser: SessionUser
) => {
  const commentToRecruitId = req.query.id as string | undefined;
  if (!commentToRecruitId)
    return res.status(404).json({ error: "投稿がありません" });

  // 投稿した本人以外削除不可
  const commentToRecruit = await prisma.commentToRecruit.findUnique({
    where: { id: commentToRecruitId },
  });
  if (commentToRecruit?.userId !== sessionUser.id)
    return res.status(403).json({ error: "権限がありません" });

  await prisma.commentToRecruit.delete({
    where: { id: commentToRecruitId },
  });

  res.status(200).end();
};
