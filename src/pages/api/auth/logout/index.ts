import { NextApiRequest, NextApiResponse } from "next";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { deleteCookie } from "cookies-next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        await getHandler(req, res);
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

// GET request
export type LogoutResponseSuccessBody = "";

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponseSuccessBody | ResponseErrorBody>
) => {
  // TODO: firebase authのuseridもここで消したい
  deleteCookie("userId", { req, res });

  res.status(200).end();
};
