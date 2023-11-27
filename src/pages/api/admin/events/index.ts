import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { paginate } from "prisma-extension-pagination";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import { EventSimple } from "@/types/event";
import { getCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";
import { EventLocationDateType, User } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const currentFbUserIdToken = getCookie("currentFbUserIdToken", { req, res });

  if (!currentFbUserIdToken) {
    console.warn("## currentFbUserIdToken", currentFbUserIdToken);
    return res.status(401).json({ error: "ログインしてください" });
  }

  const fbAuthRes = await verifyIdToken(currentFbUserIdToken);
  if (!fbAuthRes.ok) {
    console.warn("## fbAuthRes.ok === false", fbAuthRes);
    return res.status(401).json({ error: "再ログインしてください。" });
  }
  const data = await fbAuthRes.json();
  const fbUser = data.users[0];
  const fbUid = fbUser.localId;

  if (!fbUser.emailVerified) {
    console.warn("## fbUser.emailVerified === false");
    return res.status(401).json({ error: "メール認証が未完了です" });
  }

  const user = await prisma.user.findUnique({ where: { fbUid } });
  const userId = getCookie("userId", { req, res });
  if (!user || user.id !== userId) {
    console.warn("## !user || user.id !== userId === false", user, userId);
    return res.status(401).json({ error: "再ログインしてください。" });
  }

  if (user.role !== "ADMIN") {
    console.warn("## user.role is not ADMIN");
    return res.status(403).json({ error: "権限がありません" });
  }

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
  user: User
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
    twitterContentTag?: string;
    gameTypeIds: string[];
    eventLocations: {
      locationId: string;
      building?: string;
      description?: string;
      dateType: EventLocationDateType;
      startedAt?: string;
      endedAt?: string;
      eventLocationDates: string[];
      detailedSchedule?: string;
    }[];
  };
};
export type PostEventByAdminResponseSuccessBody = { eventLocationId: string };

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PostEventByAdminResponseSuccessBody | ResponseErrorBody>,
  user: User
) => {
  const rawParams: PostEventByAdminRequestBody = req.body;

  const schema = z.object({
    event: z.object({
      name: z.string().min(1).max(30),
      organizationId: z.string().optional(),
      description: z.string().max(1000).optional(),
      sourceUrl: z.string().optional(),
      coverImageFileKey: z.string().optional(),
      numberOfPeopleInTeam: z.string().optional(),
      timeRequired: z.string().optional(),
      twitterTag: z.string().optional(),
      twitterContentTag: z.string().optional(),
      gameTypeIds: z.string().array(),
      eventLocations: z
        .object({
          locationId: z.string().min(1),
          building: z.string().max(12).optional(),
          description: z.string().max(200).optional(),
          dateType: z.nativeEnum(EventLocationDateType), // どちらのタイプでも強制入力ではない
          startedAt: z.string().optional(),
          endedAt: z.string().optional(),
          eventLocationDates: z.string().array(),
          detailedSchedule: z.string().max(100).optional(),
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
      ...(eventData.twitterContentTag && {
        twitterContentTag: eventData.twitterContentTag,
      }),
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

  const eventLocationIds = [] as string[];
  for (const el of eventData.eventLocations) {
    const eventLocation = await prisma.eventLocation.create({
      data: {
        eventId: event.id,
        locationId: el.locationId,
        dateType: el.dateType,
        ...(el.building && { building: el.building }),
        ...(el.description && { description: el.description }),
        ...(el.dateType === "RANGE" &&
          el.startedAt && { startedAt: el.startedAt }),
        ...(el.dateType === "RANGE" && el.endedAt && { endedAt: el.endedAt }),
        ...(el.detailedSchedule && {
          detailedSchedule: el.detailedSchedule,
        }),
      },
    });

    eventLocationIds.push(eventLocation.id);

    if (el.dateType === "INDIVISUAL") {
      for (const eventLocationDate of el.eventLocationDates) {
        await prisma.eventLocationDate.create({
          data: { eventLocationId: eventLocation.id, date: eventLocationDate },
        });
      }
    }
  }

  res.status(200).json({ eventLocationId: eventLocationIds[0] });
};
