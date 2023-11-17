import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import { getCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";
import { User } from "@prisma/client";
import { RecruitDetail } from "@/types/recruit";
import { userAgent } from "next/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        await getHandler(req, res);
        break;

      case "PATCH": {
        const currentFbUserIdToken = getCookie("currentFbUserIdToken", {
          req,
          res,
        });

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

        await patchHandler(req, res, user);
        break;
      }

      case "DELETE": {
        const currentFbUserIdToken = getCookie("currentFbUserIdToken", {
          req,
          res,
        });

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

        await deleteHandler(req, res, user);
        break;
      }

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
export type GetRecruitResponseSuccessBody = {
  recruit: RecruitDetail;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetRecruitResponseSuccessBody | ResponseErrorBody>
) => {
  const recruitId = req.query.id as string | undefined;
  if (!recruitId) return res.status(404).json({ error: "募集がありません" });

  const recruit = await prisma.recruit.findUnique({
    where: { id: recruitId },
    include: {
      user: {
        include: {
          userGameTypes: { include: { gameType: true } },
          userStrongAreas: { include: { strongArea: true } },
        },
      },
      eventLocation: { include: { event: true, location: true } },
      possibleDates: true,
      commentsToRecruit: {
        include: {
          user: {
            include: {
              userGameTypes: { include: { gameType: true } },
              userStrongAreas: { include: { strongArea: true } },
            },
          },
        },
      },
      recruitTagRecruits: { include: { recruitTag: true } },
    },
  });
  if (!recruit) return res.status(404).json({ error: "募集がありません" });

  const recruitData = {
    id: recruit.id,
    ...(recruit.user && {
      user: {
        id: recruit.user.id,
        name: recruit.user.name || "名無しさん",
        ...(recruit.user.iconImageFileKey && {
          iconImageUrl: await generateReadSignedUrl(
            recruit.user.iconImageFileKey
          ),
        }),
        ...(recruit.user.sex && { sex: recruit.user.sex }),
        ...(recruit.user.age && { age: recruit.user.age }),
        ...(recruit.user.startedAt && {
          startedAt: recruit.user.startedAt.toISOString(),
        }),
        ...(recruit.user.description && {
          description: recruit.user.description,
        }),
        ...(recruit.user.twitter && { twitter: recruit.user.twitter }),
        ...(recruit.user.instagram && {
          instagram: recruit.user.instagram,
        }),
        userGameTypes: recruit.user.userGameTypes.map((ugt) => ({
          id: ugt.id,
          gameType: { id: ugt.gameType.id, name: ugt.gameType.name },
          likeOrDislike: ugt.likeOrDislike,
        })),
        userStrongAreas: recruit.user.userStrongAreas.map((usa) => ({
          id: usa.id,
          strongArea: {
            id: usa.strongArea.id,
            name: usa.strongArea.name,
          },
        })),
      },
    }),

    ...(recruit.manualEventName && {
      manualEventName: recruit.manualEventName,
    }),
    ...(recruit.manualLocation && {
      manualLocation: recruit.manualLocation,
    }),
    ...(recruit.eventLocation && {
      eventLocation: {
        id: recruit.eventLocation.id,
        ...(recruit.eventLocation.building && {
          building: recruit.eventLocation.building,
        }),
        event: {
          id: recruit.eventLocation.event.id,
          name: recruit.eventLocation.event.name,
          ...(recruit.eventLocation.event?.coverImageFileKey && {
            coverImageFileUrl: await generateReadSignedUrl(
              recruit.eventLocation.event.coverImageFileKey
            ),
          }),
          ...(recruit.eventLocation.event.sourceUrl && {
            sourceUrl: recruit.eventLocation.event.sourceUrl,
          }),
          ...(recruit.eventLocation.event.twitterTag && {
            twitterTag: recruit.eventLocation.event.twitterTag,
          }),
          ...(recruit.eventLocation.event.twitterContentTag && {
            twitterContentTag: recruit.eventLocation.event.twitterContentTag,
          }),
        },
        location: {
          id: recruit.eventLocation.location.id,
          name: recruit.eventLocation.location.name,
        },
      },
    }),
    ...(recruit.numberOfPeople && { numberOfPeople: recruit.numberOfPeople }),
    ...(recruit.description && { description: recruit.description }),
    recruitTags: recruit.recruitTagRecruits.map((rtr) => ({
      id: rtr.recruitTag.id,
      name: rtr.recruitTag.name,
    })),
    possibleDates: recruit.possibleDates.map((date) => ({
      id: date.id,
      date: date.date.toISOString(),
      hours: date.hours,
      priority: date.priority,
    })),
    commentsToRecruit: await Promise.all(
      recruit.commentsToRecruit.map(async (comment) => ({
        id: comment.id,
        message: comment.message,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        user: {
          id: comment.user.id,
          name: comment.user.name || "名無しさん",
          ...(comment.user.iconImageFileKey && {
            iconImageUrl: await generateReadSignedUrl(
              comment.user.iconImageFileKey
            ),
          }),
          ...(comment.user.sex && { sex: comment.user.sex }),
          ...(comment.user.age && { age: comment.user.age }),
          ...(comment.user.startedAt && {
            startedAt: comment.user.startedAt.toISOString(),
          }),
          ...(comment.user.description && {
            description: comment.user.description,
          }),
          ...(comment.user.twitter && { twitter: comment.user.twitter }),
          ...(comment.user.instagram && { instagram: comment.user.instagram }),
          // userGameTypes: comment.user.userGameTypes.map((ugt) => ({
          //   id: ugt.id,
          //   gameType: { id: ugt.gameType.id, name: ugt.gameType.name },
          //   likeOrDislike: ugt.likeOrDislike,
          // })),
          // userStrongAreas: comment.user.userStrongAreas.map((usa) => ({
          // }))
        },
      }))
    ),
    createdAt: recruit.createdAt.toISOString(),
  };

  res.status(200).json({
    recruit: recruitData,
  });
};

// PATCH request
export type PatchRecruitRequestBody = {
  isSelectType: boolean;
  recruit: {
    manualEventName?: string;
    manualLocation?: string;
    eventLocationId?: string;
    numberOfPeople?: number;
    description?: string;
  };
  recruitTagIds: string[];
  possibleDates: {
    date: string;
    hours: string;
    priority: number;
  }[];
};
export type PatchRecruitResponseSuccessBody = "";

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PatchRecruitResponseSuccessBody | ResponseErrorBody>,
  user: User
) => {
  const recruitId = req.query.id as string | undefined;
  if (!recruitId) return res.status(404).json({ error: "募集がありません" });

  const recruit = await prisma.recruit.findUnique({
    where: { id: recruitId },
    include: { user: true },
  });
  if (!recruit) return res.status(404).json({ error: "募集がありません" });

  // 投稿者しか更新できない
  if (!recruit.user || recruit.user.id !== user.id) {
    return res.status(403).json({ error: "権限がありません" });
  }

  const rawParams: PatchRecruitRequestBody = req.body;

  const schema = z
    .object({
      isSelectType: z.boolean(),
      recruit: z.object({
        manualEventName: z.string().max(30).optional(),
        manualLocation: z.string().max(30).optional(),
        eventLocationId: z.string().optional(),
        numberOfPeople: z.number().min(1),
        description: z.string().min(10).max(200),
      }),
      recruitTagIds: z.string().array(),
      possibleDates: z
        .object({
          date: z.string().min(1),
          hours: z.string().min(1).max(15),
          priority: z.number().min(1),
        })
        .array()
        .min(1)
        .max(2),
    })
    .superRefine((val, ctx) => {
      if (val.isSelectType && !val.recruit.eventLocationId) {
        ctx.addIssue({
          path: ["recruit.eventLocationId"],
          code: "custom",
          message: "イベントが未入力です。",
        });
      }

      if (!val.isSelectType && !val.recruit.manualLocation) {
        ctx.addIssue({
          path: ["recruit.manualLocation"],
          code: "custom",
          message: "開催場所を記載してください",
        });
      }

      if (!val.isSelectType && !val.recruit.manualEventName) {
        ctx.addIssue({
          path: ["recruit.manualEventName"],
          code: "custom",
          message: "イベント名を記載してください",
        });
      }
    });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const recruitData = validation.data.recruit;
  const recruitPrams = {
    ...(validation.data.isSelectType
      ? {
          eventLocationId: recruitData.eventLocationId!,
          manualEventName: null,
          manualLocation: null,
        }
      : {
          eventLocationId: null,
          manualEventName: recruitData.manualEventName!,
          manualLocation: recruitData.manualLocation!,
        }),
    numberOfPeople: recruitData.numberOfPeople
      ? recruitData.numberOfPeople
      : null,
    description: recruitData.description ? recruitData.description : null,
  };

  const updatedRecruit = await prisma.recruit.update({
    where: { id: recruitId },
    data: recruitPrams,
    include: { possibleDates: true, recruitTagRecruits: true },
  });

  const possibleDatesData = validation.data.possibleDates;
  // TODO: 一旦全て消す、後々更新に切り替えること
  for (const possibleDate of updatedRecruit.possibleDates) {
    await prisma.possibleDate.delete({
      where: { id: possibleDate.id },
    });
  }
  for (const possibleDate of possibleDatesData) {
    await prisma.possibleDate.create({
      data: {
        recruitId: recruitId,
        date: possibleDate.date,
        hours: possibleDate.hours,
        priority: possibleDate.priority,
      },
    });
  }

  // TODO: 一旦全て消す、後々更新に切り替えること
  for (const rtr of updatedRecruit.recruitTagRecruits) {
    await prisma.recruitTagRecruit.delete({
      where: { id: rtr.id },
    });
  }
  const recruitTagIdsData = validation.data.recruitTagIds;
  for (const recruitTagId of recruitTagIdsData) {
    await prisma.recruitTagRecruit.create({
      data: {
        recruitId: recruitId,
        recruitTagId: recruitTagId,
      },
    });
  }

  res.status(200).end();
};

// DELETE request
export type DeleteRecruitResponseSuccessBody = "";

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<DeleteRecruitResponseSuccessBody | ResponseErrorBody>,
  user: User
) => {
  const recruitId = req.query.id as string | undefined;
  if (!recruitId) return res.status(404).json({ error: "募集がありません" });

  const recruit = await prisma.recruit.findUnique({
    where: { id: recruitId },
    include: { user: true },
  });
  if (!recruit) return res.status(404).json({ error: "募集がありません" });

  // 投稿者しか削除できない
  if (!recruit.user || recruit.user.id !== user.id) {
    return res.status(403).json({ error: "権限がありません" });
  }

  await prisma.recruit.delete({
    where: { id: recruitId },
  });

  res.status(200).end();
};
