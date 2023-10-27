import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { SessionUser } from "@/types/next-auth";
import { ErrorResponse } from "@/types/errorResponse";
import { z } from "zod";
import { EventDate } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ error: "ログインしてください" });

  const user = session.user;

  if (user.role !== "ADMIN")
    return res.status(403).json({ error: "権限がありません" });

  const eventDateId = req.query.id as string | undefined;
  if (!eventDateId)
    return res.status(404).json({ error: "イベント日が存在しません" });
  const eventDate = await prisma.eventDate.findUnique({
    where: { id: eventDateId },
  });
  if (!eventDate)
    return res.status(404).json({ error: "イベント日が存在しません" });

  try {
    switch (req.method) {
      case "PATCH":
        await patchHandler(req, res, user, eventDate);
        break;

      case "DELETE":
        await deleteHandler(req, res, user, eventDate);
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
export type PatchEventDateByAdminRequestBody = {
  eventDate: {
    date: string;
  };
};
export type PatchEventDateByAdminResponseBody = "" | ErrorResponse;

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sessionUser: SessionUser,
  eventDate: EventDate
) => {
  const rawParams: PatchEventDateByAdminRequestBody = req.body;

  const schema = z.object({
    eventDate: z.object({
      date: z.string().min(1),
    }),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const date = validation.data.eventDate;

  await prisma.eventDate.update({
    where: { id: eventDate.id },
    data: { date: date.date },
  });

  res.status(200).end();
};

// DELETE request
export type DeleteEventDateByAdminResponseBody = "" | ErrorResponse;

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<DeleteEventDateByAdminResponseBody>,
  sessionUser: SessionUser,
  eventDate: EventDate
) => {
  await prisma.eventDate.delete({
    where: { id: eventDate.id },
  });

  res.status(200).end();
};
