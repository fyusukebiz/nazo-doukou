import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { Event, User } from "@prisma/client";
import { EventDetail } from "@/types/event";
import { deleteFile, generateReadSignedUrl } from "@/libs/cloudStorage";
import { getCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const currentFbUserIdToken = getCookie("currentFbUserIdToken", { req, res });

  if (!currentFbUserIdToken) {
    return res.status(401).json({ error: "ログインしてください" });
  }

  const fbAuthRes = await verifyIdToken(currentFbUserIdToken);
  if (!fbAuthRes.ok) {
    return res.status(401).json({ error: "再ログインしてください。" });
  }
  const data = await fbAuthRes.json();
  const fbUser = data.users[0];
  const fbUid = fbUser.localId;

  if (!fbUser.emailVerified) {
    return res.status(401).json({ error: "メール認証が未完了です" });
  }

  const user = await prisma.user.findUnique({ where: { fbUid } });
  const userId = getCookie("userId", { req, res });
  if (!user || user.id !== userId) {
    return res.status(401).json({ error: "再ログインしてください。" });
  }

  if (user.role !== "ADMIN") {
    return res.status(403).json({ error: "権限がありません" });
  }

  const eventId = req.query.id as string | undefined;
  if (!eventId)
    return res.status(404).json({ error: "イベントが存在しません" });
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return res.status(404).json({ error: "イベントが存在しません" });

  try {
    switch (req.method) {
      case "GET":
        await getHandler(req, res, user, eventId);
        break;

      case "PATCH":
        await patchHandler(req, res, user, eventId);
        break;

      case "DELETE":
        await deleteHandler(req, res, user, event);
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

export type GetEventByAdminResponseSuccessBody = {
  event: EventDetail;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetEventByAdminResponseSuccessBody | ResponseErrorBody>,
  user: User,
  eventId: string
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organization: true,
      eventGameTypes: { include: { gameType: true } },
      eventLocations: {
        include: {
          location: { include: { prefecture: true } },
        },
      },
    },
  });
  if (!event) return res.status(404).json({ error: "イベントが存在しません" });

  const eventData = {
    id: event.id,
    name: event.name,
    ...(event.twitterTag && { twitterTag: event.twitterTag }),
    ...(event.description && { description: event.description }),
    ...(event.sourceUrl && { sourceUrl: event.sourceUrl }),
    ...(event.numberOfPeopleInTeam && {
      numberOfPeopleInTeam: event.numberOfPeopleInTeam,
    }),
    ...(event.timeRequired && { timeRequired: event.timeRequired }),
    ...(event.coverImageFileKey && {
      coverImageFileUrl: await generateReadSignedUrl(event.coverImageFileKey),
    }),
    ...(event.organization && {
      organization: {
        id: event.organization.id,
        name: event.organization.name,
      },
    }),
    eventLocations: event.eventLocations.map((el) => ({
      id: el.id,
      location: {
        id: el.location.id,
        name: el.location.name,
      },
      ...(el.building && { building: el.building }),
      ...(el.description && { description: el.description }),
      ...(el.startedAt && { startedAt: el.startedAt.toISOString() }),
      ...(el.endedAt && { endedAt: el.endedAt.toISOString() }),
      ...(el.detailedSchedule && { detailedSchedule: el.detailedSchedule }),
    })),
    gameTypes: event.eventGameTypes.map((egt) => ({
      id: egt.gameType.id,
      name: egt.gameType.name,
    })),
  };

  res.status(200).json({
    event: eventData,
  });
};

// PATCH request
export type PatchEventByAdminRequestBody = {
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
    eventLocations: {
      locationId: string;
      description?: string;
      building?: string;
      startedAt?: string;
      endedAt?: string;
      detailedSchedule?: string;
    }[];
  };
};
export type PatchEventByAdminResponseSuccessBody = "";

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    PatchEventByAdminResponseSuccessBody | ResponseErrorBody
  >,
  user: User,
  eventId: string
) => {
  const rawParams: PatchEventByAdminRequestBody = req.body;

  const schema = z.object({
    event: z.object({
      name: z.string().min(1).max(30),
      organizationId: z.string().optional(),
      twitterTag: z.string().optional(),
      description: z.string().max(1000).optional(),
      sourceUrl: z.string().optional(),
      coverImageFileKey: z.string().optional(),
      numberOfPeopleInTeam: z.string().optional(),
      timeRequired: z.string().optional(),
      gameTypeIds: z.string().array(),
      eventLocations: z
        .object({
          locationId: z.string().min(1),
          building: z.string().max(12).optional(),
          description: z.string().max(200).optional(),
          startedAt: z.string().optional(),
          endedAt: z.string().optional(),
          detailedSchedule: z.string().max(100).optional(),
        })
        .array(),
    }),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const eventData = validation.data.event;

  const eventInDb = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    include: { eventGameTypes: true, eventLocations: true },
  });

  // 既に画像が設定されているなら事前に消す
  if (eventData.coverImageFileKey) {
    if (eventInDb.coverImageFileKey)
      await deleteFile(eventInDb.coverImageFileKey);
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      name: eventData.name,
      ...(eventData.organizationId && {
        organizationId: eventData.organizationId,
      }),
      ...(eventData.twitterTag && { twitterTag: eventData.twitterTag }),
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

  // TODO: 一旦全て消す、後々更新に切り替えること
  for (const egtId of eventInDb.eventGameTypes.map((egt) => egt.id)) {
    await prisma.eventGameType.delete({
      where: { id: egtId },
    });
  }
  const gameTypeIds = validation.data.event.gameTypeIds;
  for (const gameTypeId of gameTypeIds) {
    await prisma.eventGameType.create({
      data: { eventId, gameTypeId },
    });
  }

  for (const eleId of eventInDb.eventLocations.map((el) => el.id)) {
    await prisma.eventLocation.delete({
      where: { id: eleId },
    });
  }
  const eventLocations = validation.data.event.eventLocations;
  for (const el of eventLocations) {
    await prisma.eventLocation.create({
      data: {
        eventId: eventId,
        locationId: el.locationId,
        ...(el.description && { description: el.description }),
        ...(el.building && { building: el.building }),
        ...(el.startedAt && { startedAt: el.startedAt }),
        ...(el.endedAt && { endedAt: el.endedAt }),
        ...(el.detailedSchedule && { detailedSchedule: el.detailedSchedule }),
      },
    });
  }

  res.status(200).end();
};

// DELETE request
export type DeleteEventByAdminResponseSuccessBody = "";

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    DeleteEventByAdminResponseSuccessBody | ResponseErrorBody
  >,
  user: User,
  event: Event
) => {
  if (event.coverImageFileKey) await deleteFile(event.coverImageFileKey);

  await prisma.event.delete({
    where: { id: event.id },
  });

  res.status(200).end();
};
