import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { EventLocationEventOption } from "@/types/eventLocationEvent";

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
export type GetEventLocationEventOptionsResponseSuccessBody = {
  eventLocationEventOptions: EventLocationEventOption[];
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    GetEventLocationEventOptionsResponseSuccessBody | ResponseErrorBody
  >
) => {
  const eventLocationEvents = await prisma.eventLocationEvent.findMany({
    include: {
      event: true,
      eventLocation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // TODO: 既に終わっている公演は入れないこと
  const eventLocationEventsData = eventLocationEvents.map((ele) => ({
    id: ele.id,
    name: ele.event.name,
    location: ele.eventLocation.name,
  }));

  res.status(200).json({
    eventLocationEventOptions: eventLocationEventsData,
  });
};
