import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { SessionUser } from "@/types/next-auth";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ error: "ログインしてください" });

  const user = session.user;

  if (user.role !== "ADMIN")
    return res.status(403).json({ error: "権限がありません" });

  try {
    switch (req.method) {
      case "POST":
        await postHandler(req, res, user);
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

// POST request
export type PostEventByAdminRequestBody = {
  event: {
    organizationId?: string;
    name: string;
    description?: string;
    sourceUrl?: string;
    coverImageFileKey?: string;
    numberOfPeopleInTeam?: string;
    timeRequired?: string;
    eventLocationEvents: {
      description?: string;
      building?: string;
      eventLocationId: string;
      startedAt?: string;
      endedAt?: string;
      eventDates?: {
        date: string;
      }[];
    }[];
  };
};
export type PostEventByAdminResponseSuccessBody = "";

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PostEventByAdminResponseSuccessBody | ResponseErrorBody>,
  sessionUser: SessionUser
) => {
  const rawParams: PostEventByAdminRequestBody = req.body;

  const schema = z.object({
    event: z.object({
      name: z.string().min(1).max(255),
      organizationId: z.string().optional(),
      description: z.string().optional(),
      sourceUrl: z.string().optional(),
      coverImageFileKey: z.string().optional(),
      numberOfPeopleInTeam: z.string().optional(),
      timeRequired: z.string().optional(),
      eventLocationEvents: z
        .object({
          eventLocationId: z.string().min(1),
          building: z.string().optional(),
          description: z.string().optional(),
          startedAt: z.string().optional(), // TODO:臨時
          endedAt: z.string().optional(), // TODO:臨時
          eventDates: z
            .object({
              date: z.string().min(1), // TODO: Date型でバリデーションをかけるべき
            })
            .array()
            .optional(),
        })
        .array(),
    }),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const eventData = validation.data.event;

  // TODO: 動作確認必須！！！
  const event = await prisma.event.create({
    data: {
      name: eventData.name,
      ...(eventData.organizationId && {
        organizationId: eventData.organizationId,
      }),
      ...(eventData.description && { description: eventData.description }),
      ...(eventData.sourceUrl && { sourceUrl: eventData.sourceUrl }),
      ...(eventData.coverImageFileKey && {
        coverImageFileKey: eventData.coverImageFileKey,
      }),
      ...(eventData.numberOfPeopleInTeam && {
        numberOfPeopleInTeam: eventData.numberOfPeopleInTeam,
      }),
      ...(eventData.timeRequired && { timeRequired: eventData.timeRequired }),
    },
  });

  for (const eleData of eventData.eventLocationEvents) {
    const eventLocationEvent = await prisma.eventLocationEvent.create({
      data: {
        eventId: event.id,
        eventLocationId: eleData.eventLocationId,
        ...(eleData.startedAt && { startedAt: eleData.startedAt }),
        ...(eleData.endedAt && { endedAt: eleData.endedAt }),
        ...(eleData.building && { building: eleData.building }),
        ...(eleData.description && { description: eleData.description }),
      },
    });

    if (eleData.eventDates) {
      for (const eventDateData of eleData.eventDates) {
        const eventDate = await prisma.eventDate.create({
          data: {
            eventLocationEventId: eventLocationEvent.id,
            date: eventDateData.date,
          },
        });
      }
    }
  }

  res.status(200).end();
};
