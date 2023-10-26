import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ErrorResponse } from "@/types/errorResponse";

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
export type GetPrefecturesResponseBody =
  | {
      prefectures: {
        id: string;
        name: string;
        eventLocations: { id: string; name: string }[];
      }[];
    }
  | ErrorResponse;

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetPrefecturesResponseBody>
) => {
  const prefectures = await prisma.prefecture.findMany({
    include: { eventLocations: true },
  });

  const prefecturesData = prefectures.map((prefecture) => ({
    id: prefecture.id,
    name: prefecture.name,
    eventLocations: prefecture.eventLocations.map((loc) => ({
      id: loc.id,
      name: loc.name,
    })),
  }));

  res.status(200).json({
    prefectures: prefecturesData,
  });
};
