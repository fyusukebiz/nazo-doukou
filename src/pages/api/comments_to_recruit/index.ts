import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { User } from "@prisma/client";
import { User as FbUser } from "firebase/auth";
import { getCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";
import { emailTransporter } from "@/libs/mailer";

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
        await postHandler(req, res, fbUser, user);
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
  fbUser: FbUser,
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

  const recruit = await prisma.recruit.findUniqueOrThrow({
    where: { id: commentData.recruitId },
    include: { user: true, eventLocation: { include: { event: true } } },
  });

  if (recruit.user && fbUser.email) {
    // firebase auth
    // 募集者にメールを送る
    const html = `
      <p>${recruit.user.name}様</p>
      <p>「${
        recruit.eventLocation
          ? recruit.eventLocation.event.name
          : recruit.manualEventName
      }」の募集にコメントが来ました。</p>
      <p>${process.env.NEXT_PUBLIC_HOST}/recruits/${recruit.id}</p>
    `;

    const result = await emailTransporter.sendMail({
      to: fbUser.email,
      from: process.env.EMAIL_USER,
      subject: `【${process.env.NEXT_PUBLIC_SERVICE_NAME}】募集にコメントが来ました`,
      html: html,
    });

    const failed = result.rejected.concat(result.pending).filter(Boolean);
    if (failed.length) {
      throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
    }
  }

  res.status(200).end();
};
