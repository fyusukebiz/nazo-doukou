import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { EventLocationOption } from "@/types/eventLocation";

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
export type GetEventLocationOptionsResponseSuccessBody = {
  eventLocationOptions: EventLocationOption[];
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    GetEventLocationOptionsResponseSuccessBody | ResponseErrorBody
  >
) => {
  const eventLocations = await prisma.eventLocation.findMany({
    include: {
      event: true,
      location: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // TODO: 既に終わっている公演は入れないこと
  const eventLocationsData = eventLocations.map((el) => ({
    id: el.id,
    name: el.event.name,
    location: el.location.name,
  }));

  res.status(200).json({
    eventLocationOptions: eventLocationsData,
  });
};
