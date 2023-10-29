import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { SessionUser } from "@/types/next-auth";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { EventLocationEvent } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ error: "ログインしてください" });

  const user = session.user;

  if (user.role !== "ADMIN")
    return res.status(403).json({ error: "権限がありません" });

  const eventLocationEventId = req.query.id as string | undefined;
  if (!eventLocationEventId)
    return res.status(404).json({ error: "イベントが存在しません" });
  const eventLocationEvent = await prisma.eventLocationEvent.findUnique({
    where: { id: eventLocationEventId },
  });
  if (!eventLocationEvent)
    return res.status(404).json({ error: "イベントが存在しません" });

  try {
    switch (req.method) {
      case "PATCH":
        await patchHandler(req, res, user, eventLocationEvent);
        break;

      case "DELETE":
        await deleteHandler(req, res, user, eventLocationEvent);
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
export type PatchEventLocationEventByAdminRequestBody = {
  eventLocationEvent: {
    description?: string;
  };
};
export type PatchEventLocationEventByAdminResponseSuccessBody = "";

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    PatchEventLocationEventByAdminResponseSuccessBody | ResponseErrorBody
  >,
  sessionUser: SessionUser,
  eventLocationEvent: EventLocationEvent
) => {
  const rawParams: PatchEventLocationEventByAdminRequestBody = req.body;

  const schema = z.object({
    eventLocationEvent: z.object({
      description: z.string().optional(),
    }),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const ele = validation.data.eventLocationEvent;

  await prisma.eventLocationEvent.update({
    where: { id: eventLocationEvent.id },
    data: {
      ...(ele.description && {
        description: ele.description,
      }),
    },
  });

  res.status(200).end();
};

// DELETE request
export type DeleteEventLocationEventByAdminResponseSuccessBody = "";

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    DeleteEventLocationEventByAdminResponseSuccessBody | ResponseErrorBody
  >,
  sessionUser: SessionUser,
  eventLocationEvent: EventLocationEvent
) => {
  await prisma.eventLocationEvent.delete({
    where: { id: eventLocationEvent.id },
  });

  res.status(200).end();
};
