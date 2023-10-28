import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prisma";
import { ErrorResponse } from "@/types/errorResponse";

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
export type GetOrganizationsResponseBody =
  | {
      organizations: { id: string; name: string }[];
    }
  | ErrorResponse;

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetOrganizationsResponseBody>
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
