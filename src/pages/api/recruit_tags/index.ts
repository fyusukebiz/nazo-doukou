import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ResponseErrorBody } from "@/types/responseErrorBody";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        await getHandler(req, res);
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
export type GetRecruitTagsResponseSuccessBody = {
  recruitTags: {
    id: string;
    name: string;
  }[];
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetRecruitTagsResponseSuccessBody | ResponseErrorBody>
) => {
  const recruitTags = await prisma.recruitTag.findMany();

  const recruitTagsData = recruitTags.map((recruitTag) => ({
    id: recruitTag.id,
    name: recruitTag.name,
  }));

  res.status(200).json({
    recruitTags: recruitTagsData,
  });
};
