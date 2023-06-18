import type { NextApiRequest, NextApiResponse } from "next";
import { type ChannelAuthResponse } from "pusher";
import { z } from "zod";
import { prisma } from "~/server/db";
import { ctx } from "~/server/helpers/pusherInstance";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChannelAuthResponse | string>
) {
  if (req.method == "POST") {

    return res.status(403).end();

    const reqBody = req.body as { socket_id: string; channel_name: string };
    const socket_id = reqBody.socket_id;
    const c_id = reqBody.channel_name;

    if (!socket_id || !c_id) {
      res.status(403).end();
      return;
    }

    const result = z.string().min(3).max(20).safeParse(c_id);

    if (!result.success) {
      const error = "the result must be at between 3 and 20 characters long";
      res.send(JSON.stringify(error));
      return;
    }

    const channelId = result.data;
    const context = await ctx(req);

    if (!context) {
      res.status(403).end();
      return;
    }

    const { pusher, userData } = context;

    if (!pusher || !userData) {
      res.status(403).end();
      return;
    }

    //verify the blueprint is created....
    const blueprintResult = await prisma.blueprint.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!blueprintResult) {
      const error = "blueprint does not exist";

      res.send(JSON.stringify(error));
      return;
    }

    const authChannelResponse = pusher.authorizeChannel(socket_id, channelId);
    res.send(authChannelResponse);
  } else {
    res.status(403).end();
  }
}
