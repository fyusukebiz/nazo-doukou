import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { SessionUser } from "@/types/next-auth";
import { ErrorResponse } from "@/types/errorResponse";
import { v4 as uuidv4 } from "uuid";
import { generateUploadSignedUrl } from "@/libs/cloudStorage";

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
export type GetAdminNewEventResponseBody =
  | { uploadCoverImageUrl: string }
  | ErrorResponse;

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetAdminNewEventResponseBody>,
  sessionUser: SessionUser
) => {
  const fileKey = uuidv4();

  const data = {
    uploadCoverImageUrl: await generateUploadSignedUrl(fileKey),
  };

  res.status(200).json(data);
};
