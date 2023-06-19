import { type NextApiRequest, type NextApiResponse } from "next";
import { type UserAuthResponse } from "pusher";
import { ctx } from "~/server/helpers/pusherInstance";

type body = {
  socket_id: string;
};

export default async function UserAuthHandler(
  req: NextApiRequest,
  res: NextApiResponse<UserAuthResponse>
) {
  if (req.method === "POST") {
    const { socket_id } = req.body as body;

    //if a socket id is not given, do not allow them to connect to pusher
    if (!socket_id) {
      res.status(403).end();
      return;
    }

    const data = await ctx(req);

    if (!data) {
      res.status(403).end();
      return;
    }

    const { pusher, userData } = data;

    if (!pusher || !userData) {
      res.status(403).end();
      return;
    }

    const authResponse = pusher.authenticateUser(socket_id, userData);

    // authResponse.auth = authResponse.auth.substring(1, authResponse.auth.length - 1);
    // authResponse.auth = authResponse.auth.replace(/\\/g, "");
    // console.log("user auth response: ", authResponse)

    res.send(authResponse);
  } else {
    res.status(403).end();
  }
}