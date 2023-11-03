import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { SessionUser } from "@/types/next-auth";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { generateReadSignedUrl } from "@/libs/cloudStorage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  try {
    switch (req.method) {
      case "GET":
        await getHandler(req, res);
        break;

      case "PATCH":
        if (!session)
          return res.status(401).json({ error: "ログインしてください" });

        await patchHandler(req, res, session.user);
        break;

      case "DELETE":
        if (!session)
          return res.status(401).json({ error: "ログインしてください" });

        await deleteHandler(req, res, session.user);
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
export type GetRecruitResponseSuccessBody = {
  recruit: {
    id: string;
    user: {
      id?: string;
      name: string;
      iconImageUrl?: string;
      twitter?: string;
      instagram?: string;
    };
    eventName: string;
    eventLocation?: string;
    numberOfPeople?: number;
    description?: string;
    createdAt: string;
    possibleDate: {
      id: string;
      date: string;
      priority?: number;
    }[];
    recruitTags: { id: string; name: string }[];
    comments: {
      id: string;
      message: string;
      createdAt: string;
      updatedAt: string;
      user: {
        id: string;
        name: string;
        iconImageUrl?: string;
      };
    }[];
  };
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
      user: true,
      event: true,
      eventLocationEvent: { include: { eventLocation: true } },
      possibleDates: true,
      commentToRecruits: { include: { user: true } },
      recruitTagRecruits: { include: { recruitTag: true } },
    },
  });
  if (!recruit) return res.status(404).json({ error: "募集がありません" });

  const recruitData = {
    id: recruit.id,
    ...(recruit.user
      ? {
          user: {
            name: recruit.user.name || "名無しさん",
            ...(recruit.user.iconImageFileKey && {
              iconImageUrl: await generateReadSignedUrl(
                recruit.user.iconImageFileKey
              ),
            }),
            ...(recruit.user.twitter && { twitter: recruit.user.twitter }),
            ...(recruit.user.instagram && {
              instagram: recruit.user.instagram,
            }),
          },
        }
      : { user: { name: "名無しさん" } }),
    eventName: recruit.event ? recruit.event.name : recruit.eventName!, // どちらかは必ずデータがある
    ...(recruit.eventLocationEvent && {
      eventLocation: recruit.eventLocationEvent.eventLocation.name,
    }),
    ...(recruit.numberOfPeople && { numberOfPeople: recruit.numberOfPeople }),
    ...(recruit.description && { description: recruit.description }),
    recruitTags: recruit.recruitTagRecruits.map((rtr) => ({
      id: rtr.recruitTag.id,
      name: rtr.recruitTag.name,
    })),
    possibleDate: recruit.possibleDates.map((date) => ({
      id: date.id,
      date: date.date.toISOString(),
      ...(date.priority && { priority: date.priority }),
    })),
    comments: await Promise.all(
      recruit.commentToRecruits.map(async (comment) => ({
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
  recruit: {
    eventName?: string;
    eventLocation?: string;
    eventId?: string;
    eventLocationEventId?: string;
    numberOfPeople?: number;
    description?: string;
  };
  possibleDats: {
    date: string;
    priority: number;
  }[];
};
export type PatchRecruitResponseSuccessBody = "";

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PatchRecruitResponseSuccessBody | ResponseErrorBody>,
  sessionUser: SessionUser
) => {
  const recruitId = req.query.id as string | undefined;
  if (!recruitId) return res.status(404).json({ error: "募集がありません" });

  const rawParams: PatchRecruitRequestBody = req.body;

  const schema = z
    .object({
      recruit: z.object({
        eventName: z.string().optional(),
        eventLocation: z.string().optional(),
        eventId: z.string().optional(),
        eventLocationEventId: z.string().optional(),
        numberOfPeople: z.number().optional(),
        description: z.string().optional(),
      }),
      recruitTagIds: z.string().array(),
      possibleDates: z
        .object({
          date: z.string().min(1),
          priority: z.number().optional(),
        })
        .array(),
    })
    .refine((args) => args.recruit.eventId || args.recruit.eventName, {
      message: "イベント名を入力してください",
      path: ["recruit.eventId"],
    });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const recruitData = validation.data.recruit;
  const recruit = await prisma.recruit.update({
    where: { id: recruitId },
    data: recruitData,
    include: { possibleDates: true, recruitTagRecruits: true },
  });

  const possibleDatesData = validation.data.possibleDates;
  // TODO: 一旦全て消す、後々更新に切り替えること
  for (const possibleDate of recruit.possibleDates) {
    await prisma.possibleDate.delete({
      where: { id: possibleDate.id },
    });
  }
  for (const possibleDate of possibleDatesData) {
    await prisma.possibleDate.create({
      data: {
        recruitId: recruit.id,
        date: possibleDate.date,
        priority: possibleDate.priority,
      },
    });
  }

  // TODO: 一旦全て消す、後々更新に切り替えること
  for (const rtr of recruit.recruitTagRecruits) {
    await prisma.recruitTagRecruit.delete({
      where: { id: rtr.id },
    });
  }
  const recruitTagIdsData = validation.data.recruitTagIds;
  for (const recruitTagId of recruitTagIdsData) {
    await prisma.recruitTagRecruit.create({
      data: {
        recruitId: recruit.id,
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
  sessionUser: SessionUser
) => {
  const recruitId = req.query.id as string | undefined;

  await prisma.recruit.delete({
    where: { id: recruitId },
  });

  res.status(200).end();
};
