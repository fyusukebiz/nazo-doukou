import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import { EventLocationEventDetail } from "@/types/eventLocationEvent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const eventLocationEventId = req.query.id as string | undefined;
  if (!eventLocationEventId)
    return res.status(404).json({ error: "イベントが存在しません" });

  try {
    switch (req.method) {
      case "GET":
        await getHandler(req, res, eventLocationEventId);
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
export type GetEventLocationEventResponseSuccessBody = {
  eventLocationEvent: EventLocationEventDetail;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    GetEventLocationEventResponseSuccessBody | ResponseErrorBody
  >,
  eventLocationEventId: string
) => {
  const ele = await prisma.eventLocationEvent.findUnique({
    where: { id: eventLocationEventId },
    include: {
      event: {
        include: {
          organization: true,
          eventGameTypes: { include: { gameType: true } },
        },
      },
      eventLocation: { include: { prefecture: true } },
    },
  });
  if (!ele) return res.status(404).json({ error: "イベントが存在しません" });

  const eventLocationEventData = {
    id: ele.id,
    ...(ele.startedAt && { startedAt: ele.startedAt.toISOString() }),
    ...(ele.endedAt && { endedAt: ele.endedAt.toISOString() }),
    ...(ele.detailedSchedule && { detailedSchedule: ele.detailedSchedule }),
    ...(ele.building && { building: ele.building }),
    ...(ele.description && { description: ele.description }),
    event: {
      id: ele.event.id,
      name: ele.event.name,
      ...(ele.event.coverImageFileKey && {
        coverImageFileUrl: await generateReadSignedUrl(
          ele.event.coverImageFileKey
        ),
      }),
      ...(ele.event.numberOfPeopleInTeam && {
        numberOfPeopleInTeam: ele.event.numberOfPeopleInTeam,
      }),
      ...(ele.event.timeRequired && { timeRequired: ele.event.timeRequired }),
      ...(ele.event.twitterTag && { twitterTag: ele.event.twitterTag }),
      ...(ele.event.description && { description: ele.event.description }),
      ...(ele.event.sourceUrl && { sourceUrl: ele.event.sourceUrl }),
      ...(ele.event.organization && {
        organization: {
          id: ele.event.organization.id,
          name: ele.event.organization.name,
        },
      }),
      gameTypes: ele.event.eventGameTypes.map((egt) => ({
        id: egt.gameType.id,
        name: egt.gameType.name,
      })),
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

  res.status(200).json({
    eventLocationEvent: eventLocationEventData,
  });
};
