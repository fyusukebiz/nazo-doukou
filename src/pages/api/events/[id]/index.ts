import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import { Event } from "@/types/event";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const eventId = req.query.id as string | undefined;
  if (!eventId)
    return res.status(404).json({ error: "イベントが存在しません" });

  try {
    switch (req.method) {
      case "GET":
        await getHandler(req, res, eventId);
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

export type GetEventResponseSuccessBody = {
  event: Event;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetEventResponseSuccessBody | ResponseErrorBody>,
  eventId: string
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organization: true,
      eventGameTypes: { include: { gameType: true } },
      eventLocationEvents: {
        include: {
          eventLocation: { include: { prefecture: true } },
        },
      },
    },
  });
  if (!event) return res.status(404).json({ error: "イベントが存在しません" });

  const eventLocations = await prisma.eventLocation.findMany();
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
              ...(ele.building && { building: ele.building }),
              ...(ele.description && { description: ele.description }),
              ...(loc.color && { color: loc.color }),
              ...(loc.bgColor && { bgColor: loc.bgColor }),
              ...(ele.startedAt && { startedAt: ele.startedAt.toISOString() }),
              ...(ele.endedAt && { endedAt: ele.endedAt.toISOString() }),
              ...(ele.detailedSchedule && {
                detailedSchedule: ele.detailedSchedule,
              }),
            };
          })
          .filter((data) => !!data),
      };
    })
    .filter(
      (pref): pref is Event["prefectures"][number] =>
        pref.eventLocations.length > 0
    );

  const eventData = {
    id: event.id,
    name: event.name,
    gameTypes: event.eventGameTypes.map((egt) => ({
      id: egt.gameType.id,
      name: egt.gameType.name,
    })),
    ...(event.numberOfPeopleInTeam && {
      numberOfPeopleInTeam: event.numberOfPeopleInTeam,
    }),
    ...(event.timeRequired && { timeRequired: event.timeRequired }),
    ...(event.organization && {
      organization: {
        id: event.organization.id,
        name: event.organization.name,
      },
    }),
    ...(event.twitterTag && { twitterTag: event.twitterTag }),
    ...(event.description && { description: event.description }),
    ...(event.sourceUrl && { sourceUrl: event.sourceUrl }),
    ...(event.coverImageFileKey && {
      coverImageFileUrl: await generateReadSignedUrl(event.coverImageFileKey),
    }),
    prefectures: prefecturesData,
  };

  res.status(200).json({
    event: eventData,
  });
};
