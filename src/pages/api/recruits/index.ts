import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { paginate } from "prisma-extension-pagination";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import { getCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";
import {
  EventLocation,
  Location,
  PossibleDate,
  Recruit,
  User,
  Event as EventInDb,
} from "@prisma/client";
import { RecruitSimple } from "@/types/recruit";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        if (req.query.onlyMine) {
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

          await getHandler(req, res, user);
        } else {
          await getHandler(req, res);
        }
        break;
      }

      case "POST": {
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

        await postHandler(req, res, user);
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
export type GetRecruitsResponseSuccessBody = {
  recruits: RecruitSimple[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetRecruitsResponseSuccessBody | ResponseErrorBody>,
  user?: User
) => {
  const page = Number(req.query.page || 1);
  const freeWord = req.query.freeWord as string | undefined;
  const orderBy = req.query.orderBy as string | undefined; // createdAt | possibleDate

  let recruits = [] as (Recruit & {
    eventLocation:
      | (EventLocation & { event: EventInDb; location: Location })
      | null;
    possibleDates: PossibleDate[];
  })[];
  let totalCount: number;
  let totalPages: number;
  let currentPage: number;

  if (orderBy === "possibleDate") {
    const recruitIdsData = await prisma.possibleDate.groupBy({
      by: ["recruitId"],
      where: {
        ...(user && { userId: user.id }),
        ...(freeWord && {
          recruit: {
            OR: [
              { eventLocation: { event: { name: { contains: freeWord } } } },
              { manualEventName: { contains: freeWord } },
            ],
          },
        }),
      },
      orderBy: { _min: { date: "desc" } },
      take: 30,
      skip: (page - 1) * 30,
    });

    const recruitIds = recruitIdsData.map((r) => r.recruitId);

    // 取得した配列通りに並ばせる
    // prismaはorderby fieldに対応してない
    // https://github.com/prisma/prisma/issues/9708
    const _recruits = await prisma.recruit.findMany({
      where: { id: { in: recruitIds } },
      include: {
        eventLocation: { include: { event: true, location: true } },
        possibleDates: true,
      },
    });
    // 取得した配列通りに並ばせる
    recruitIds.forEach((id) => {
      const recruit = _recruits.find((r) => r.id === id)!;
      recruits.push(recruit);
    });

    totalCount = await prisma.recruit.count();
    totalPages = Math.round(totalCount / 30);
    currentPage = page;
  } else {
    const prismaWithPaginate = prisma.$extends({
      model: { recruit: { paginate } },
    });

    const result = await prismaWithPaginate.recruit
      .paginate({
        ...(user && { where: { userId: user.id } }),
        ...(freeWord && {
          where: {
            ...(user && { userId: user.id }),
            OR: [
              { eventLocation: { event: { name: { contains: freeWord } } } },
              { manualEventName: { contains: freeWord } },
            ],
          },
        }),
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
    recruits = result[0];
    const meta = result[1];
    totalCount = meta.totalCount;
    totalPages = meta.pageCount;
    currentPage = meta.currentPage;
  }

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
          // 数字が小さい方が、配列の頭（左側）の方に配置される, nullは最後
          if (a.priority === null) {
            return 1;
          }
          if (b.priority === null) {
            return -1;
          }
          if (a.priority === b.priority) {
            return 0;
          }
          return a.priority < b.priority ? -1 : 1;
        })
        .map((date) => ({
          id: date.id,
          date: date.date.toISOString(),
          ...(date.priority && { priority: date.priority }),
        })),
      createdAt: recruit.createdAt.toISOString(),
    }))
  );

  res.status(200).json({
    totalCount: totalCount, // 全ての募集の数
    totalPages: totalPages, // 全ページ数
    currentPage: currentPage, // 現在のページ
    recruits: recruitsData,
  });
};

// POST request
export type PostRecruitRequestBody = {
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
    priority?: number;
  }[];
};
export type PostRecruitResponseSuccessBody = { recruitId: string };

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PostRecruitResponseSuccessBody | ResponseErrorBody>,
  user: User
) => {
  const rawParams: PostRecruitRequestBody = req.body;

  const schema = z
    .object({
      isSelectType: z.boolean(),
      recruit: z.object({
        manualEventName: z.string().optional(),
        manualLocation: z.string().optional(),
        eventLocationId: z.string().optional(),
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
  const recruit = await prisma.recruit.create({
    data: { ...recruitData, userId: user.id },
  });

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
