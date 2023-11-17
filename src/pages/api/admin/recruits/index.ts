import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { paginate } from "prisma-extension-pagination";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import { getCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";
import { User } from "@prisma/client";
import { RecruitSimple } from "@/types/recruit";

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

  try {
    switch (req.method) {
      case "GET": {
        await getHandler(req, res);
        break;
      }

      case "POST": {
        await postHandler(req, res);
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
export type GetRecruitsByAdminResponseSuccessBody = {
  recruits: RecruitSimple[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    GetRecruitsByAdminResponseSuccessBody | ResponseErrorBody
  >,
  user?: User
) => {
  const page = Number(req.query.page || 1);

  const prismaWithPaginate = prisma.$extends({
    model: { recruit: { paginate } },
  });

  const [recruits, meta] = await prismaWithPaginate.recruit
    .paginate({
      where: { userId: null }, //  管理側で作ったもの
      include: {
        eventLocation: { include: { event: true, location: true } },
        possibleDates: true,
      },
      orderBy: { createdAt: "desc" },
    })
    .withPages({
      limit: 30, // 1ページあたりの最大数
      page: page,
      includePageCount: true,
    });

  const recruitsData = await Promise.all(
    recruits.map(async (recruit) => ({
      id: recruit.id,
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
            ...(recruit.eventLocation.event.coverImageFileKey && {
              coverImageFileUrl: await generateReadSignedUrl(
                recruit.eventLocation.event.coverImageFileKey
              ),
            }),
          },
          location: {
            id: recruit.eventLocation.location.id,
            name: recruit.eventLocation.location.name,
          },
        },
      }),
      ...(recruit.numberOfPeople && { numberOfPeople: recruit.numberOfPeople }),
      possibleDates: recruit.possibleDates
        .sort((a, b) => {
          // 数字が小さい方が、配列の頭（左側）の方に配置される
          if (a.priority === b.priority) {
            return 0;
          }
          return a.priority < b.priority ? -1 : 1;
        })
        .map((date) => ({
          id: date.id,
          date: date.date.toISOString(),
          hours: date.hours,
          priority: date.priority,
        })),
      createdAt: recruit.createdAt.toISOString(),
    }))
  );

  res.status(200).json({
    totalCount: meta.totalCount, // 全ての募集の数
    totalPages: meta.pageCount, // 全ページ数
    currentPage: meta.currentPage, // 現在のページ
    recruits: recruitsData,
  });
};

// POST request
export type PostRecruitByAdminRequestBody = {
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
export type PostRecruitByAdminResponseSuccessBody = { recruitId: string };

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    PostRecruitByAdminResponseSuccessBody | ResponseErrorBody
  >
) => {
  const rawParams: PostRecruitByAdminRequestBody = req.body;

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

      if (
        val.isSelectType &&
        (!!val.recruit.manualLocation || !!val.recruit.manualEventName)
      ) {
        ctx.addIssue({
          path: ["recruit.manualEventName"],
          code: "custom",
          message: "入力が間違っています",
        });
      }

      if (!val.isSelectType && !!val.recruit.eventLocationId) {
        ctx.addIssue({
          path: ["recruit.eventLocationId"],
          code: "custom",
          message: "入力が間違っています",
        });
      }
    });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const recruitData = validation.data.recruit;
  const recruit = await prisma.recruit.create({
    data: recruitData,
  });

  const possibleDatesData = validation.data.possibleDates;
  for (const possibleDate of possibleDatesData) {
    await prisma.possibleDate.create({
      data: {
        recruitId: recruit.id,
        date: possibleDate.date,
        hours: possibleDate.hours,
        priority: possibleDate.priority,
      },
    });
  }

  for (const recruitTagId of validation.data.recruitTagIds) {
    await prisma.recruitTagRecruit.create({
      data: {
        recruitId: recruit.id,
        recruitTagId: recruitTagId,
      },
    });
  }

  res.status(200).json({ recruitId: recruit.id });
};
