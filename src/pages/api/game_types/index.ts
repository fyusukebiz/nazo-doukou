import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        await getHandler(req, res);
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
export type GetGameTypesResponseSuccessBody = {
  gameTypes: { id: string; name: string }[];
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetGameTypesResponseSuccessBody | ResponseErrorBody>
) => {
  const gameTypes = await prisma.gameType.findMany();

  const gameTypesData = gameTypes.map((type) => ({
    id: type.id,
    name: type.name,
  }));
  res.status(200).json({
    gameTypes: gameTypesData,
  });
};
