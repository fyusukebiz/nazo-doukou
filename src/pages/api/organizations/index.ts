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
export type GetOrganizationsResponseSuccessBody = {
  organizations: { id: string; name: string }[];
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetOrganizationsResponseSuccessBody | ResponseErrorBody>
) => {
  const organizations = await prisma.organization.findMany();

  const organizationsData = organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
  }));
  res.status(200).json({
    organizations: organizationsData,
  });
};
