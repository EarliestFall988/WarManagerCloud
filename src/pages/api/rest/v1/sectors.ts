import { type Prisma } from "@prisma/client";
import {
  type NextApiHandler,
  type NextApiRequest,
  type NextApiResponse,
} from "next";

import { env } from "process";
import { prisma } from "~/server/db";

const restAPIKey = env.TEST_REST_API_KEY;

type getSectorsReqBodyType = {
  api_key?: string;
};

const sectors: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  if (!restAPIKey) {
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }

  const bdy = req.body as string;

  const reqBody = JSON.parse(bdy) as getSectorsReqBodyType;

  const api_key = reqBody.api_key ?? "";

  console.log(api_key);

  if (!api_key) {
    res.status(400).json({ message: "Bad Request" });
    return;
  }

  if (api_key !== restAPIKey) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const sectors = await prisma.sector.findMany({
    select: {
      id: true,
      name: true,
      departmentCode: true,
      Projects: {
        select: {
          id: true,
          name: true,
          TotalManHours: true,
          jobNumber: true,
          materialCost: true,
          equipmentCost: true,
          subContractorCost: true,
          laborCost: true,
          otherCost: true,
          startDate: true,
          state: true,
          status: true,
          endDate: true,
        },
      },
    },
  });

  res.status(200).json({ sectors });
};

export default sectors;
