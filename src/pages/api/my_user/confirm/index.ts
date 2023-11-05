import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { v4 as uuidv4 } from "uuid";
import { ResponseErrorBody } from "@/types/responseErrorBody";
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

  try {
    switch (req.method) {
      case "POST": {
        await postHandler(req, res, fbUid);
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

// TODO: GET? POST?
// POST request
export type PostConfirmMyUserResponseSuccessBody = "";

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    PostConfirmMyUserResponseSuccessBody | ResponseErrorBody
  >,
  fbUid: string
) => {
  const user = await prisma.user.findUnique({
    where: { fbUid: fbUid },
  });

  // 万が一、fbUifに紐づくuserがなければ作成
  if (!user) {
    await prisma.user.create({
      data: { fbUid: fbUid, name: uuidv4() },
    });
  }

  return res.status(200).end();
};
