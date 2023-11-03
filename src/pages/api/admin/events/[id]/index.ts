import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { SessionUser } from "@/types/next-auth";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { Event } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(401).json({ error: "ログインしてください" });

  const user = session.user;

  if (user.role !== "ADMIN")
    return res.status(403).json({ error: "権限がありません" });

  const eventId = req.query.id as string | undefined;
  if (!eventId)
    return res.status(404).json({ error: "イベントが存在しません" });
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return res.status(404).json({ error: "イベントが存在しません" });

  try {
    switch (req.method) {
      case "PATCH":
        await patchHandler(req, res, user, event);
        break;

      case "DELETE":
        await deleteHandler(req, res, user, event);
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
export type PatchEventByAdminRequestBody = {
  event: {
    name: string;
    description?: string;
    sourceUrl?: string;
    coverImageFileKey?: string;
  };
};
export type PatchEventByAdminResponseSuccessBody = "";

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    PatchEventByAdminResponseSuccessBody | ResponseErrorBody
  >,
  sessionUser: SessionUser,
  event: Event
) => {
  const rawParams: PatchEventByAdminRequestBody = req.body;

  const schema = z.object({
    event: z.object({
      name: z.string().min(1).max(255),
      twitterTag: z.string().optional(),
      organizationId: z.string().optional(),
      description: z.string().optional(),
      sourceUrl: z.string().optional(),
      coverImageFileKey: z.string().optional(),
    }),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const eventData = validation.data.event;

  // TODO: 動作確認必須！！！
  await prisma.event.update({
    where: { id: event.id },
    data: {
      name: eventData.name,
      ...(eventData.organizationId && {
        organizationId: eventData.organizationId,
      }),
      ...(eventData.twitterTag && { twitterTag: eventData.twitterTag }),
      ...(eventData.description && { description: eventData.description }),
      ...(eventData.sourceUrl && { sourceUrl: eventData.sourceUrl }),
      ...(eventData.coverImageFileKey && {
        coverImageFileKey: eventData.coverImageFileKey,
      }),
    },
  });

  res.status(200).end();
};

// DELETE request
export type DeleteEventByAdminResponseSuccessBody = "";

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    DeleteEventByAdminResponseSuccessBody | ResponseErrorBody
  >,
  sessionUser: SessionUser,
  event: Event
) => {
  await prisma.event.delete({
    where: { id: event.id },
  });

  res.status(200).end();
};
