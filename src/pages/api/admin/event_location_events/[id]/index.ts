import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { EventLocationEvent, User } from "@prisma/client";
import { getCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";

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
  if (!user) {
    return res.status(401).json({ error: "再ログインしてください。" });
  }

  if (user.role !== "ADMIN") {
    return res.status(403).json({ error: "権限がありません" });
  }

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
  user: User,
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
  user: User,
  eventLocationEvent: EventLocationEvent
) => {
  await prisma.eventLocationEvent.delete({
    where: { id: eventLocationEvent.id },
  });

  res.status(200).end();
};
