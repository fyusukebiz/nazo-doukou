import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";
import { z } from "zod";
import { EventLocation, User } from "@prisma/client";
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

  const eventLocationId = req.query.id as string | undefined;
  if (!eventLocationId)
    return res.status(404).json({ error: "イベントが存在しません" });
  const eventLocation = await prisma.eventLocation.findUnique({
    where: { id: eventLocationId },
  });
  if (!eventLocation)
    return res.status(404).json({ error: "イベントが存在しません" });

  try {
    switch (req.method) {
      case "PATCH":
        await patchHandler(req, res, user, eventLocation);
        break;

      case "DELETE":
        await deleteHandler(req, res, user, eventLocation);
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
export type PatchEventLocationByAdminRequestBody = {
  eventLocation: {
    description?: string;
  };
};
export type PatchEventLocationByAdminResponseSuccessBody = "";

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    PatchEventLocationByAdminResponseSuccessBody | ResponseErrorBody
  >,
  user: User,
  eventLocation: EventLocation
) => {
  const rawParams: PatchEventLocationByAdminRequestBody = req.body;

  const schema = z.object({
    eventLocation: z.object({
      description: z.string().optional(),
    }),
  });

  const validation = schema.safeParse(rawParams);
  if (!validation.success)
    return res.status(400).json({ error: "入力に間違いがあります" });

  const el = validation.data.eventLocation;

  await prisma.eventLocation.update({
    where: { id: eventLocation.id },
    data: {
      ...(el.description && {
        description: el.description,
      }),
    },
  });

  res.status(200).end();
};

// DELETE request
export type DeleteEventLocationByAdminResponseSuccessBody = "";

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    DeleteEventLocationByAdminResponseSuccessBody | ResponseErrorBody
  >,
  user: User,
  eventLocation: EventLocation
) => {
  await prisma.eventLocation.delete({
    where: { id: eventLocation.id },
  });

  res.status(200).end();
};
