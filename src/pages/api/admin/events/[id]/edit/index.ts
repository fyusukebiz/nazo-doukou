import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { SessionUser } from "@/types/next-auth";
import { ErrorResponse } from "@/types/errorResponse";
import { v4 as uuidv4 } from "uuid";
import { generateUploadSignedUrl } from "@/libs/cloudStorage";
import prisma from "@/libs/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ error: "ログインしてください" });

  const user = session.user;

  if (user.role !== "ADMIN")
    return res.status(403).json({ error: "権限がありません" });

  const eventId = req.query.id as string | undefined;
  if (!eventId)
    return res.status(404).json({ error: "イベントが存在しません" });
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return res.status(404).json({ error: "イベントが存在しません" });

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
export type GetAdminEditEventResponseBody =
  | { uploadCoverImageUrl: string }
  | ErrorResponse;

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetAdminEditEventResponseBody>,
  sessionUser: SessionUser
) => {
  const fileKey = uuidv4();

  const data = {
    uploadCoverImageUrl: await generateUploadSignedUrl(fileKey),
  };

  res.status(200).json(data);
};
