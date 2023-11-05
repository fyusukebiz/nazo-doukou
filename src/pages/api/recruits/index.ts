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
  try {
    switch (req.method) {
      case "GET":
        await getHandler(req, res);
        break;

      case "POST":
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
        if (!user) {
          return res.status(401).json({ error: "再ログインしてください。" });
        }

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
  recruits: RecruitSimple[];
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
        eventLocationEvent: { include: { event: true, eventLocation: true } },
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
      ...(recruit.manualEventName && {
        manualEventName: recruit.manualEventName,
      }),
      ...(recruit.manualEventLocation && {
        manualEventLocation: recruit.manualEventLocation,
      }),
      ...(recruit.eventLocationEvent && {
        eventLocationEvent: {
          id: recruit.eventLocationEvent.id,
          ...(recruit.eventLocationEvent.building && {
            building: recruit.eventLocationEvent.building,
          }),
          event: {
            id: recruit.eventLocationEvent.event.id,
            name: recruit.eventLocationEvent.event.name,
            ...(recruit.eventLocationEvent.event.coverImageFileKey && {
              coverImageFileUrl: await generateReadSignedUrl(
                recruit.eventLocationEvent.event.coverImageFileKey
              ),
            }),
          },
          eventLocation: {
            id: recruit.eventLocationEvent.eventLocation.id,
            name: recruit.eventLocationEvent.eventLocation.name,
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
    totalCount: meta.totalCount,
    totalPages: meta.pageCount,
    currentPage: meta.currentPage,
    recruits: recruitsData,
  });
};

// POST request
export type PostRecruitRequestBody = {
  isSelectType: boolean;
  recruit: {
    manualEventName?: string;
    manualEventLocation?: string;
    eventLocationEventId?: string;
    numberOfPeople?: number;
    description?: string;
  };
  recruitTagIds: string[];
  possibleDates: {
    date: string;
    priority?: number;
  }[];
};
export type PostRecruitResponseSuccessBody = "";

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
        manualEventLocation: z.string().optional(),
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
    .superRefine((val, ctx) => {
      if (val.isSelectType && !val.recruit.eventLocationEventId) {
        ctx.addIssue({
          path: ["recruit.eventLocationEventId"],
          code: "custom",
          message: "イベントが未入力です。",
        });
      }

      if (!val.isSelectType && !val.recruit.manualEventLocation) {
        ctx.addIssue({
          path: ["recruit.manualEventLocation"],
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

  res.status(200).end();
};
