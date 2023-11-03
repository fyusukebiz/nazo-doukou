import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import { paginate } from "prisma-extension-pagination";
import { EventLocationEventSimple } from "@/types/eventLocationEvent";

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
export type GetEventLocationEventsResponseSuccessBody = {
  eventLocationEvents: EventLocationEventSimple[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    GetEventLocationEventsResponseSuccessBody | ResponseErrorBody
  >
) => {
  const page = Number(req.query.page || 1);

  const prismaWithPaginate = prisma.$extends({
    model: { eventLocationEvent: { paginate } },
  });

  const [eventLocationEvents, meta] =
    await prismaWithPaginate.eventLocationEvent
      .paginate({
        include: {
          event: true,
          eventLocation: { include: { prefecture: true } },
        },
      })
      .withPages({
        limit: 20, // 1ページあたりの最大数
        page: page,
        includePageCount: true,
      });

  const eventLocationEventsData = await Promise.all(
    eventLocationEvents.map(async (ele) => {
      return {
        id: ele.id,
        ...(ele.startedAt && { startedAt: ele.startedAt.toISOString() }),
        ...(ele.endedAt && { startedAt: ele.endedAt.toISOString() }),
        event: {
          id: ele.event.id,
          name: ele.event.name,
          ...(ele.event.coverImageFileKey && {
            coverImageFileUrl: await generateReadSignedUrl(
              ele.event.coverImageFileKey
            ),
          }),
        },
        eventLocation: {
          id: ele.eventLocation.id,
          name: ele.eventLocation.name,
          prefecture: {
            id: ele.eventLocation.prefecture.id,
            name: ele.eventLocation.prefecture.name,
          },
        },
      };
    })
  );

  res.status(200).json({
    totalCount: meta.totalCount,
    totalPages: meta.pageCount,
    currentPage: meta.currentPage,
    eventLocationEvents: eventLocationEventsData,
  });
};
