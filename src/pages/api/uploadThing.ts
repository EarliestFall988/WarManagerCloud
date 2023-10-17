import { getAuth } from "@clerk/nextjs/server";
import { type NextApiRequest, type NextApiResponse } from "next";
import { createNextPageApiHandler } from "uploadthing/next-legacy";

import { ourFileRouter } from "src/server/uploadThing";
import { string } from "lib0";

const handler = createNextPageApiHandler({
  router: ourFileRouter,
});

export default async function uploadthing(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Do something before the uploadthing handler runs
  const { userId } = getAuth(req);
  if (userId) {
    // add the userId to the body

    if (req.body) {
      const body = req.body as string;
      req.body = JSON.stringify({ ...JSON.parse(body), userId });
    } else {
      req.body = JSON.stringify({ userId });
    }
  }
  await handler(req, res);
}
