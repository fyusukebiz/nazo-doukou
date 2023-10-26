import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { SessionUser } from "@/types/next-auth";
import { ErrorResponse } from "@/types/errorResponse";
import { z } from "zod";
import { EventHour } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ error: "ログインしてください" });

  const user = session.user;

  if (user.role !== "ADMIN")
    return res.status(403).json({ error: "権限がありません" });

  const eventHourId = req.query.id as string | undefined;
  if (!eventHourId)
    return res.status(404).json({ error: "イベント時間が存在しません" });
  const eventHour = await prisma.eventHour.findUnique({
    where: { id: eventHourId },
  });
  if (!eventHour)
    return res.status(404).json({ error: "イベント時間が存在しません" });

  try {
    switch (req.method) {
      case "PATCH":
        await patchHandler(req, res, user, eventHour);
        break;

      case "DELETE":
        await deleteHandler(req, res, user, eventHour);
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

// PATCH request
export type PatchEventHourRequestBody = {
  eventHour: {
    startedAt: string;
    endedAt: string;
  };
};
export type PatchEventHourResponseBody = "" | ErrorResponse;

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sessionUser: SessionUser,
  eventHour: EventHour
) => {
  const rawParams: PatchEventHourRequestBody = req.body;

  const schema = z.object({
    eventHour: z.object({
      startedAt: z.string().optional(),
      endedAt: z.string().optional(),
    }),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const hour = validation.data.eventHour;

  await prisma.eventHour.update({
    where: { id: eventHour.id },
    data: {
      startedAt: hour.startedAt,
      endedAt: hour.endedAt,
    },
  });

  res.status(200).end();
};

// DELETE request
export type DeleteEventHourResponseBody = "" | ErrorResponse;

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<DeleteEventHourResponseBody>,
  sessionUser: SessionUser,
  eventHour: EventHour
) => {
  await prisma.eventHour.delete({
    where: { id: eventHour.id },
  });

  res.status(200).end();
};
