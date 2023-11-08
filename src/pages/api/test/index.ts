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
      case "GET": {
        await getHandler(req, res);

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

// TODO: 削除する！
// GET request
export type GetRecruitsResponseSuccessBody = {
  recruits: any;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetRecruitsResponseSuccessBody | ResponseErrorBody>
) => {
  const page = Number(req.query.page || 1);
  const freeWord = req.query.freeWord as string | undefined;

  // 1. 各募集で一番古い日付（getTimeしたときに数値が小さい日付）を取得する
  // 2. その日付を使って募集を並び替える
  // 3. ページごとの30個を取得する
  const recruitIds = await prisma.possibleDate.groupBy({
    by: ["recruitId"],
    where: {
      // ...(user && { userId: user.id }),
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

  const data = recruitIds.map((rId) => rId.recruitId);

  res.status(200).json({
    recruits: recruitIds,
  });
};
