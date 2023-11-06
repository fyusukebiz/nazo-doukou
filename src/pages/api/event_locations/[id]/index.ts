import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import { EventLocationDetail } from "@/types/eventLocation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const eventLocationId = req.query.id as string | undefined;
  if (!eventLocationId)
    return res.status(404).json({ error: "イベントが存在しません" });

  try {
    switch (req.method) {
      case "GET":
        await getHandler(req, res, eventLocationId);
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
export type GetEventLocationResponseSuccessBody = {
  eventLocation: EventLocationDetail;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetEventLocationResponseSuccessBody | ResponseErrorBody>,
  eventLocationId: string
) => {
  const el = await prisma.eventLocation.findUnique({
    where: { id: eventLocationId },
    include: {
      event: {
        include: {
          organization: true,
          eventGameTypes: { include: { gameType: true } },
        },
      },
      location: { include: { prefecture: true } },
    },
  });
  if (!el) return res.status(404).json({ error: "イベントが存在しません" });

  const eventLocationData = {
    id: el.id,
    ...(el.startedAt && { startedAt: el.startedAt.toISOString() }),
    ...(el.endedAt && { endedAt: el.endedAt.toISOString() }),
    ...(el.detailedSchedule && { detailedSchedule: el.detailedSchedule }),
    ...(el.building && { building: el.building }),
    ...(el.description && { description: el.description }),
    event: {
      id: el.event.id,
      name: el.event.name,
      ...(el.event.coverImageFileKey && {
        coverImageFileUrl: await generateReadSignedUrl(
          el.event.coverImageFileKey
        ),
      }),
      ...(el.event.numberOfPeopleInTeam && {
        numberOfPeopleInTeam: el.event.numberOfPeopleInTeam,
      }),
      ...(el.event.timeRequired && { timeRequired: el.event.timeRequired }),
      ...(el.event.twitterTag && { twitterTag: el.event.twitterTag }),
      ...(el.event.description && { description: el.event.description }),
      ...(el.event.sourceUrl && { sourceUrl: el.event.sourceUrl }),
      ...(el.event.organization && {
        organization: {
          id: el.event.organization.id,
          name: el.event.organization.name,
        },
      }),
      gameTypes: el.event.eventGameTypes.map((egt) => ({
        id: egt.gameType.id,
        name: egt.gameType.name,
      })),
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

  res.status(200).json({
    eventLocation: eventLocationData,
  });
};
