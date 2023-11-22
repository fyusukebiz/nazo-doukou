import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import { paginate } from "prisma-extension-pagination";
import { EventLocationSimple } from "@/types/eventLocation";

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
export type GetEventLocationsResponseSuccessBody = {
  eventLocations: EventLocationSimple[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetEventLocationsResponseSuccessBody | ResponseErrorBody>
) => {
  const page = Number(req.query.page || 1);
  const eventName = req.query.eventName as string | undefined;
  const locationIds = (req.query.locationIds as string | undefined)?.split(",");
  const gameTypeIds = (req.query.gameTypeIds as string | undefined)?.split(",");
  // const date = req.query.date as string | undefined;

  const prismaWithPaginate = prisma.$extends({
    model: { eventLocation: { paginate } },
  });

  const [eventLocations, meta] = await prismaWithPaginate.eventLocation
    .paginate({
      where: {
        ...((eventName || (gameTypeIds && gameTypeIds.length > 0)) && {
          // event: {
          //   ...(eventName && { name: eventName }),
          //   ...(gameTypeIds && {
          //     eventGameTypes: { some: { gameTypeId: { in: gameTypeIds } } },
          //   }),
          // },
          // TODO: SQLを見てみること
          AND: [
            ...(eventName ? [{ event: { name: eventName } }] : []),
            ...(gameTypeIds
              ? [
                  {
                    event: {
                      eventGameTypes: {
                        some: { gameTypeId: { in: gameTypeIds } },
                      },
                    },
                  },
                ]
              : []),
          ],
        }),
        ...(locationIds &&
          locationIds.length > 0 && { locationId: { in: locationIds } }),
      },
      include: {
        event: true,
        location: { include: { prefecture: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    .withPages({
      limit: 20, // 1ページあたりの最大数
      page: page,
      includePageCount: true,
    });

  const eventLocationsData = await Promise.all(
    eventLocations.map(async (el) => {
      return {
        id: el.id,
        ...(el.startedAt && { startedAt: el.startedAt.toISOString() }),
        ...(el.endedAt && { startedAt: el.endedAt.toISOString() }),
        event: {
          id: el.event.id,
          name: el.event.name,
          ...(el.event.coverImageFileKey && {
            coverImageFileUrl: await generateReadSignedUrl(
              el.event.coverImageFileKey
            ),
          }),
          ...(el.event.timeRequired && { timeRequired: el.event.timeRequired }),
        },
        location: {
          id: el.location.id,
          name: el.location.name,
          prefecture: {
            id: el.location.prefecture.id,
            name: el.location.prefecture.name,
          },
        },
      };
    })
  );

  res.status(200).json({
    totalCount: meta.totalCount,
    totalPages: meta.pageCount,
    currentPage: meta.currentPage,
    eventLocations: eventLocationsData,
  });
};
