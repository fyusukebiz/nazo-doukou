import { NextApiRequest, NextApiResponse } from "next";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { v4 as uuidv4 } from "uuid";
import { generateUploadSignedUrl } from "@/libs/cloudStorage";
import { getCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";
import prisma from "@/libs/prisma";
import { User } from "@prisma/client";

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
      case "GET":
        await getHandler(req, res, user);
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
export type GetUploadSignedUrlsResponseSuccessBody = {
  uploads: { url: string; fileKey: string }[];
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    GetUploadSignedUrlsResponseSuccessBody | ResponseErrorBody
  >,
  user: User
) => {
  const fileKey = uuidv4();

  // TODO 一度に複数個のURLを生成できるようにする
  const data = {
    uploads: [{ url: await generateUploadSignedUrl(fileKey), fileKey }],
  };

  res.status(200).json(data);
};
