import { type Prisma } from "@prisma/client";
import {
  type NextApiHandler,
  type NextApiRequest,
  type NextApiResponse,
} from "next";

import { env } from "process";
import { prisma } from "~/server/db";

const restAPIKey = env.TEST_REST_API_KEY;

type getProjectsReqBodyType = {
  api_key?: string;
  start_date?: string;
  end_date?: string;
};

const GetProjectsRESTAPI: NextApiHandler = async (
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

  const reqBody = JSON.parse(bdy) as getProjectsReqBodyType;

  const api_key = reqBody.api_key ?? "";
  const { start_date } = reqBody as { start_date?: string };
  const { end_date } = reqBody as { end_date?: string };

  //   console.log(start_date, start.toDateString());

  console.log(api_key);

  if (!api_key) {
    res.status(400).json({ message: "Bad Request" });
    return;
  }

  if (api_key !== restAPIKey) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const where = {} as Prisma.ProjectWhereInput;

  if (start_date) {
    const start = new Date(start_date);

    where.startDate = {
      lte: start,
    };
  }

  if (end_date) {
    const end = new Date(end_date);
    where.endDate = {
      gte: end,
    };
  }

  const projects = await prisma.project.findMany({
    where,
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
  });

  res.status(200).json({ projects });
};

export default GetProjectsRESTAPI;
