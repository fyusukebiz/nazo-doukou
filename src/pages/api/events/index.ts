import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ErrorResponse } from "@/types/errorResponse";
import { generateUploadSignedUrl } from "@/libs/cloudStorage";
import { addMonths, startOfMonth } from "date-fns";
import { paginate } from "prisma-extension-pagination";
import { Event } from "@/types/event";

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
export type GetEventsResponseBody =
  | {
      events: Event[];
      totalCount: number;
      totalPages: number;
      currentPage: number;
    }
  | ErrorResponse;

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetEventsResponseBody>
) => {
  const page = Number(req.query.page || 1);
  const year = req.query.year ? Number(req.query.year) : undefined;
  const month = req.query.month ? Number(req.query.month) : undefined; // 1月は0, 12月は11
  const eventLocationIds = (req.query.locationIds as string | undefined)?.split(
    ","
  );

  const eventLocations = await prisma.eventLocation.findMany();

  // 何も検索に指定がなければ、今日の日付を含むeventを30個ずつ表示する
  // 年月指定とeventLocationId指定がある場合、それで検索して、eventを30個ずつ表示する
  // 年月指指定のみある場合、それで検索して、eventを30個ずつ表示する
  // eventLocationIdのみ指定がある場合、今日の日付を含むeventを30個ずつ表示する

  const prismaWithPaginate = prisma.$extends({
    model: { event: { paginate } },
  });

  const dateCondition =
    year && month
      ? {
          gte: startOfMonth(new Date(year, month, 1)),
          lt: addMonths(startOfMonth(new Date(year, month, 1)), +1), // TODO monthが11でも翌年になるかを確認
        }
      : { gte: new Date() };

  const [events, meta] = await prismaWithPaginate.event
    .paginate({
      where: {
        eventLocationEvents: {
          some: { eventDates: { some: { date: dateCondition } } },
          ...(eventLocationIds && {
            some: { eventLocationId: { in: eventLocationIds } },
          }),
        },
      },
      include: {
        eventLocationEvents: {
          include: {
            eventLocation: { include: { prefecture: true } },
            eventDates: { include: { eventHours: true } },
          },
        },
      },
    })
    .withPages({
      limit: 20, // 1ページあたりの最大数
      page: page,
      includePageCount: true,
    });

  const eventsData = await Promise.all(
    events.map(async (event) => {
      const eventLocationEvents = event.eventLocationEvents;
      const prefectures = eventLocationEvents.map(
        (ele) => ele.eventLocation.prefecture
      );
      const uniquePrefectures = Array.from(
        new Map(prefectures.map((pref) => [pref.id, pref])).values()
      );

      const prefecturesData = uniquePrefectures
        .map((pref) => {
          const locationsInPref = eventLocations.filter(
            (loc) => loc.prefectureId === pref.id
          );
          return {
            id: pref.id,
            name: pref.name,
            eventLocations: locationsInPref
              .map((loc) => {
                const ele = eventLocationEvents.find(
                  (ele) => ele.eventLocationId === loc.id
                );
                if (!ele) return; // 対象エリアで謎解きイベントが開催されていない
                return {
                  id: loc.id,
                  name: loc.name,
                  dates: ele.eventDates.map((eventDate) => ({
                    id: eventDate.id,
                    date: eventDate.date.toISOString(),
                    hours: eventDate.eventHours.map((eventHour) => ({
                      id: eventHour.id,
                      ...(eventHour.startedAt && {
                        startedAt: eventHour.startedAt.toISOString(),
                      }),
                      ...(eventHour.endedAt && {
                        endedAt: eventHour.endedAt.toISOString(),
                      }),
                    })),
                  })),
                };
              })
              .filter((data) => !!data),
          };
        })
        .filter(
          (pref): pref is Event["prefectures"][number] =>
            pref.eventLocations.length > 0
        );

      return {
        id: event.id,
        name: event.name,
        ...(event.description && { description: event.description }),
        ...(event.sourceUrl && { sourceUrl: event.sourceUrl }),
        ...(event.coverImageFileKey && {
          coverImageFileUrl: await generateUploadSignedUrl(
            event.coverImageFileKey
          ),
        }),
        prefectures: prefecturesData,
      };
    })
  );

  res.status(200).json({
    totalCount: meta.totalCount,
    totalPages: meta.pageCount,
    currentPage: meta.currentPage,
    events: eventsData,
  });
};
