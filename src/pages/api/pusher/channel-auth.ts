import type { NextApiRequest, NextApiResponse } from "next";
import { type ChannelAuthResponse } from "pusher";
import { z } from "zod";
import { prisma } from "~/server/db";
import { ctx } from "~/server/helpers/pusherInstance";

type errorResponse = {
  error: string;
}

// type authResponse = {
//   socket_id: string;
//   channelId: string;
//   key: {
//     auth: string
//   }
// }

export default async function ChannelAuthHandler(
  req: NextApiRequest,
  res: NextApiResponse<ChannelAuthResponse | errorResponse>
) {
  if (req.method == "POST") {
    const reqBody = req.body as { socket_id: string; channel_name: string };
    const socket_id = reqBody.socket_id;
    const c_id = reqBody.channel_name;

    // console.log("socket_id: ", socket_id)

    if (!socket_id || !c_id) {
      res.status(403).end();
      return;
    }


    const result = z.string().min(3).max(100).safeParse(c_id);

    if (!result.success) {
      const error = "the channel name must be at between 3 and 100 characters long";
      console.log("error: ", error);
      const errorResponse: errorResponse = { error };
      res.status(403).send(errorResponse);
      return;
    }

    const containsPresencePrefix = result.data.startsWith("presence-");

    if (!containsPresencePrefix) {
      const error = "the result must start with presence-";
      console.log("error: ", error);
      const errorResponse: errorResponse = { error };
      res.status(403).send(errorResponse);
    }

    const channelId = result.data.replace("presence-", "");
    const context = await ctx(req);

    if (!context) {
      res.status(403).end();
      return;
    }

    // console.log("channelId: ", channelId)

    // const p = GetPusher();

    // const response = p.authorizeChannel(socket_id, channelId);

    //verify the blueprint is created....
    const blueprintResult = await prisma.blueprint.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!blueprintResult) {
      const error = "blueprint does not exist";
      console.log("error: ", error);
      const errorResponse: errorResponse = { error };
      res.status(403).send(errorResponse);
      return;
    }

    const { pusher, userData } = context;

    if (!pusher || !userData) {

      res.status(403).end();
      return;
    }


    // understand that the user is allowed to access the blueprint
    // should an access code go out ??

    console.log("success");
    const authChannelResponse = pusher.authorizeChannel(socket_id, result.data, {
      user_id: userData.id,
      user_info: {
        name: userData.user_info.name,
        email: userData.user_info.email,
        avatar: userData.user_info.avatar,
      },
    });
    res.send(authChannelResponse);
    // console.log("authChannelResponse: ", authChannelResponse)
  }
  else {
    res.status(403).end();
  }
}
