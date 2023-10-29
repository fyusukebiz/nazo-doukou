import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { SessionUser } from "@/types/next-auth";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { Sex } from "@prisma/client";
import { paginate } from "prisma-extension-pagination";
import { generateReadSignedUrl } from "@/libs/cloudStorage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        await getHandler(req, res);
        break;

      case "POST":
        const session = await getServerSession(req, res, authOptions);

        if (!session)
          return res.status(401).json({ error: "ログインしてください" });

        const user = session.user;

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
export type GetRecruitsResponseSuccessBody = {
  recruits: {
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
  }[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetRecruitsResponseSuccessBody | ResponseErrorBody>
) => {
  const page = Number(req.query.page || 1);

  const prismaWithPaginate = prisma.$extends({
    model: { recruit: { paginate } },
  });

  // TODO: 場所と日付とイベント名検索をあとでつけること

  const [recruits, meta] = await prismaWithPaginate.recruit
    .paginate({
      include: {
        user: true,
        event: true,
        eventLocationEvent: { include: { eventLocation: true } },
        possibleDates: true,
      },
    })
    .withPages({
      limit: 30, // 1ページあたりの最大数
      page: page,
      includePageCount: true,
    });

  const recruitsData = await Promise.all(
    recruits.map(async (recruit) => ({
      id: recruit.id,
      ...(recruit.user
        ? {
            user: {
              id: recruit.user.id,
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
      possibleDate: recruit.possibleDates.map((date) => ({
        id: date.id,
        date: date.date.toISOString(),
        ...(date.priority && { priority: date.priority }),
      })),
      createdAt: recruit.createdAt.toISOString(),
    }))
  );

  res.status(200).json({
    totalCount: meta.totalCount,
    totalPages: meta.pageCount,
    currentPage: meta.currentPage,
    recruits: recruitsData,
  });
};

// POST request
export type PostRecruitRequestBody = {
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
export type PostRecruitResponseSuccessBody = "";

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PostRecruitResponseSuccessBody | ResponseErrorBody>,
  sessionUser: SessionUser
) => {
  const rawParams: PostRecruitRequestBody = req.body;

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
  const recruit = await prisma.recruit.create({ data: recruitData });

  const possibleDatesData = validation.data.possibleDates;
  for (const possibleDate of possibleDatesData) {
    await prisma.possibleDate.create({
      data: {
        recruitId: recruit.id,
        date: possibleDate.date,
        priority: possibleDate.priority,
      },
    });
  }

  res.status(200).end();
};
