import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { Event, EventLocationDateType, User } from "@prisma/client";
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
          eventLocationDates: true,
        },
      },
    },
  });
  if (!event) return res.status(404).json({ error: "イベントが存在しません" });

  const eventData = {
    id: event.id,
    name: event.name,
    ...(event.twitterTag && { twitterTag: event.twitterTag }),
    ...(event.twitterContentTag && {
      twitterContentTag: event.twitterContentTag,
    }),
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
      dateType: el.dateType,
      ...(el.building && { building: el.building }),
      ...(el.description && { description: el.description }),
      ...(el.startedAt && { startedAt: el.startedAt.toISOString() }),
      ...(el.endedAt && { endedAt: el.endedAt.toISOString() }),
      eventLocationDates: el.eventLocationDates.map((eld) => ({
        id: eld.id,
        date: eld.date.toISOString(),
      })),
    })),
    eventGameTypes: event.eventGameTypes.map((egt) => ({
      id: egt.id,
      gameType: {
        id: egt.gameType.id,
        name: egt.gameType.name,
      },
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
    twitterContentTag?: string;
    gameTypeIds: string[];
    eventLocations: {
      id?: string; // undefinedなら新規作成
      locationId: string;
      description?: string;
      building?: string;
      dateType: EventLocationDateType;
      startedAt?: string;
      endedAt?: string;
      eventLocationDates: string[];
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
      twitterContentTag: z.string().optional(),
      description: z.string().max(1000).optional(),
      sourceUrl: z.string().optional(),
      coverImageFileKey: z.string().optional(),
      numberOfPeopleInTeam: z.string().optional(),
      timeRequired: z.string().optional(),
      gameTypeIds: z.string().array(),
      eventLocations: z
        .object({
          id: z.string().optional(),
          locationId: z.string().min(1),
          building: z.string().max(20).optional(),
          description: z.string().max(200).optional(),
          dateType: z.nativeEnum(EventLocationDateType), // どちらのタイプでも強制入力ではない
          startedAt: z.string().optional(),
          endedAt: z.string().optional(),
          eventLocationDates: z.string().array(),
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

  /* EventGameType  */
  const newGameTypeIds = validation.data.event.gameTypeIds;
  const gameTypeIdsInDb = eventInDb.eventGameTypes.map((egt) => egt.gameTypeId);

  // EventGameType：作成
  const gameTypeIdsToCreate = newGameTypeIds.filter((newGtId) =>
    gameTypeIdsInDb.every((gtIdInDb) => gtIdInDb !== newGtId)
  );
  for (const gameTypeId of gameTypeIdsToCreate) {
    await prisma.eventGameType.create({
      data: { eventId, gameTypeId },
    });
  }

  // EventGameType：削除
  const gameTypeIdsToDelete = gameTypeIdsInDb.filter((gtIdInDb) =>
    newGameTypeIds.every((newGtId) => gtIdInDb !== newGtId)
  );
  for (const gameTypeId of gameTypeIdsToDelete) {
    await prisma.eventGameType.delete({
      where: { eventId_gameTypeId: { eventId, gameTypeId } },
    });
  }

  /* EventLocation */
  const newEventLocations = validation.data.event.eventLocations;

  // EventLocation：新規作成
  const eventLocationsToCreate = newEventLocations.filter((el) => !el.id);
  for (const el of eventLocationsToCreate) {
    const eventLocation = await prisma.eventLocation.create({
      data: {
        eventId: eventId,
        locationId: el.locationId,
        dateType: el.dateType,
        ...(el.description && { description: el.description }),
        ...(el.building && { building: el.building }),
        ...(el.dateType === "RANGE" &&
          el.startedAt && { startedAt: el.startedAt }),
        ...(el.dateType === "RANGE" && el.endedAt && { endedAt: el.endedAt }),
      },
    });

    if (el.dateType === "INDIVISUAL") {
      for (const eventLocationDate of el.eventLocationDates) {
        await prisma.eventLocationDate.create({
          data: { eventLocationId: eventLocation.id, date: eventLocationDate },
        });
      }
    }
  }

  // EventLocation：更新
  const eventLocationsToUpdate = newEventLocations.filter((el) => !!el.id);
  for (const el of eventLocationsToUpdate) {
    const eventLocationInDb = await prisma.eventLocation.update({
      where: { id: el.id },
      data: {
        locationId: el.locationId,
        dateType: el.dateType,
        description: !!el.description ? el.description : null,
        building: !!el.building ? el.building : null,
        startedAt:
          el.dateType === "RANGE" && !!el.startedAt ? el.startedAt : null,
        endedAt: el.dateType === "RANGE" && !!el.endedAt ? el.endedAt : null,
      },
      include: { eventLocationDates: true },
    });

    /* EventLocationDate */

    if (el.dateType === "INDIVISUAL") {
      // EventLocationDate：削除
      const eventLocationDatesInDb = eventLocationInDb.eventLocationDates;
      const eventLocationDatesToDelete = eventLocationDatesInDb.filter(
        (eldInDb) => !el.eventLocationDates.includes(eldInDb.date.toISOString())
      );
      for (const eld of eventLocationDatesToDelete) {
        await prisma.eventLocationDate.delete({ where: { id: eld.id } });
      }

      // EventLocationDate：新規作成＆更新
      for (const eventLocationDate of el.eventLocationDates) {
        await prisma.eventLocationDate.upsert({
          where: {
            eventLocationId_date: {
              eventLocationId: eventLocationInDb.id,
              date: eventLocationDate,
            },
          },
          create: {
            eventLocationId: eventLocationInDb.id,
            date: eventLocationDate,
          },
          update: {},
        });
      }
    }
  }

  // 削除
  const eventLocationsInDb = eventInDb.eventLocations;
  const eventLocationIdsToDelete = eventLocationsInDb
    .filter((elInDb) =>
      newEventLocations.every((newEl) => elInDb.id !== newEl.id)
    )
    .map((el) => el.id);

  for (const eleId of eventLocationIdsToDelete) {
    await prisma.eventLocation.delete({
      where: { id: eleId },
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
