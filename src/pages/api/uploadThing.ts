import { getAuth } from "@clerk/nextjs/server";
import { type NextApiRequest, type NextApiResponse } from "next";
import { createNextPageApiHandler } from "uploadthing/next-legacy";

import { ourFileRouter } from "src/server/uploadThing";

const handler = createNextPageApiHandler({
  router: ourFileRouter,
});

// export default handler;

type jsonBody = {
  files: string[];
};

export default async function uploadthing(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //   console.log("/n/n/n/t req", req);

  // Do something before the uploadthing handler runs
  const { userId } = getAuth(req);

  console.log("userId", userId);

  if (userId) {
    // add the userId to the body

    console.log(req.body);

    if (req.body) {
      const { body } = req as { body: jsonBody };
      console.log(body);

      req.body = JSON.stringify({ ...body, userId });
    } else {
      req.body = JSON.stringify({ userId });
    }
  }
  await handler(req, res);
}
