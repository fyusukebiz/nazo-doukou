import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { SessionUser } from "@/types/next-auth";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { paginate } from "prisma-extension-pagination";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import { EventSimple } from "@/types/event";

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
      case "GET":
        await getHandler(req, res, user);
        break;

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

// GET request
export type GetEventsByAdminResponseSuccessBody = {
  events: EventSimple[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetEventsByAdminResponseSuccessBody | ResponseErrorBody>,
  sessionUser: SessionUser
) => {
  const page = Number(req.query.page || 1);

  const prismaWithPaginate = prisma.$extends({
    model: { event: { paginate } },
  });

  const [events, meta] = await prismaWithPaginate.event
    .paginate({
      orderBy: { createdAt: "desc" },
    })
    .withPages({
      limit: 20, // 1ページあたりの最大数
      page: page,
      includePageCount: true,
    });

  const eventsData = await Promise.all(
    events.map(async (event) => ({
      id: event.id,
      name: event.name,
      ...(event.coverImageFileKey && {
        coverImageFileUrl: await generateReadSignedUrl(event.coverImageFileKey),
      }),
    }))
  );

  res.status(200).json({
    totalCount: meta.totalCount,
    totalPages: meta.pageCount,
    currentPage: meta.currentPage,
    events: eventsData,
  });
};

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
    twitterTag?: string;
    gameTypeIds: string[];
    eventLocationEvents: {
      description?: string;
      building?: string;
      eventLocationId: string;
      startedAt?: string;
      endedAt?: string;
      detailedSchedule?: string;
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
      twitterTag: z.string().optional(),
      gameTypeIds: z.string().array(),
      eventLocationEvents: z
        .object({
          eventLocationId: z.string().min(1),
          building: z.string().optional(),
          description: z.string().optional(),
          startedAt: z.string().optional(),
          endedAt: z.string().optional(),
          detailedSchedule: z.string().optional(),
        })
        .array(),
    }),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const eventData = validation.data.event;

  const event = await prisma.event.create({
    data: {
      name: eventData.name,
      ...(eventData.organizationId && {
        organizationId: eventData.organizationId,
      }),
      ...(eventData.description && { description: eventData.description }),
      ...(eventData.sourceUrl && { sourceUrl: eventData.sourceUrl }),
      ...(eventData.twitterTag && { twitterTag: eventData.twitterTag }),
      ...(eventData.coverImageFileKey && {
        coverImageFileKey: eventData.coverImageFileKey,
      }),
      ...(eventData.numberOfPeopleInTeam && {
        numberOfPeopleInTeam: eventData.numberOfPeopleInTeam,
      }),
      ...(eventData.timeRequired && { timeRequired: eventData.timeRequired }),
    },
  });

  for (const gameTypeId of eventData.gameTypeIds) {
    await prisma.eventGameType.create({
      data: { gameTypeId, eventId: event.id },
    });
  }

  for (const eleData of eventData.eventLocationEvents) {
    await prisma.eventLocationEvent.create({
      data: {
        eventId: event.id,
        eventLocationId: eleData.eventLocationId,
        ...(eleData.startedAt && { startedAt: eleData.startedAt }),
        ...(eleData.endedAt && { endedAt: eleData.endedAt }),
        ...(eleData.building && { building: eleData.building }),
        ...(eleData.description && { description: eleData.description }),
        ...(eleData.detailedSchedule && {
          detailedSchedule: eleData.detailedSchedule,
        }),
      },
    });
  }

  res.status(200).end();
};
