import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { SessionUser } from "@/types/next-auth";
import { ErrorResponse } from "@/types/errorResponse";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ error: "ログインしてください" });

  const user = session.user;

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
export type PostCommentToRecruitResponseBody = "" | ErrorResponse;

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sessionUser: SessionUser
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
    data: { ...commentData, userId: sessionUser.id },
  });

  res.status(200).end();
};
