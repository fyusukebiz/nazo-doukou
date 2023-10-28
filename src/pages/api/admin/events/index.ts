import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { SessionUser } from "@/types/next-auth";
import { ErrorResponse } from "@/types/errorResponse";
import { z } from "zod";

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

// POST request
export type PostEventByAdminRequestBody = {
  event: {
    organizationId?: string;
    name: string;
    description?: string;
    sourceUrl?: string;
    coverImageFileKey?: string;
    eventLocationEvents: {
      description?: string;
      eventLocationId: string;
      eventDates?: {
        date: string;
        eventHours?: {
          startedAt?: string;
          endedAt?: string;
        }[];
      }[];
    }[];
  };
};
export type PostEventByAdminResponseBody = "" | ErrorResponse;

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
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
      eventLocationEvents: z
        .object({
          eventLocationId: z.string().min(1),
          description: z.string().optional(),
          eventDates: z
            .object({
              date: z.string().min(1), // TODO: Date型でバリデーションをかけるべき
              eventHours: z
                .object({
                  startedAt: z.string().optional(),
                  endedAt: z.string().optional(),
                })
                .array()
                .optional(),
            })
            .array()
            .optional(),
        })
        .array(),
    }),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const eventData = validation.data.event;

  // TODO: 動作確認必須！！！
  const event = await prisma.event.create({
    data: {
      name: eventData.name,
      ...(eventData.organizationId && {
        organizationId: eventData.organizationId,
      }),
      ...(eventData.description && { description: eventData.description }),
      ...(eventData.sourceUrl && { sourceUrl: eventData.sourceUrl }),
      ...(eventData.coverImageFileKey && {
        coverImageFileKey: eventData.coverImageFileKey,
      }),
    },
  });

  for (const eleData of eventData.eventLocationEvents) {
    const eventLocationEvent = await prisma.eventLocationEvent.create({
      data: {
        eventId: event.id,
        eventLocationId: eleData.eventLocationId,
        ...(eleData.description && { description: eleData.description }),
      },
    });

    if (eleData.eventDates) {
      for (const eventDateData of eleData.eventDates) {
        const eventDate = await prisma.eventDate.create({
          data: {
            eventLocationEventId: eventLocationEvent.id,
            date: eventDateData.date,
          },
        });

        if (eventDateData.eventHours) {
          for (const eventHourData of eventDateData.eventHours) {
            await prisma.eventHour.create({
              data: {
                eventDateId: eventDate.id,
                ...(eventHourData.startedAt && {
                  startedAt: eventHourData.startedAt,
                }),
                ...(eventHourData.endedAt && {
                  endedAt: eventHourData.endedAt,
                }),
              },
            });
          }
        }
      }
    }
  }

  res.status(200).end();
};
