import { clerkClient } from "@clerk/nextjs";
import { type NextResponse, type NextRequest } from "next/server";
import { SendMessageToDeveloper } from "~/server/helpers/sendEmailHelper";

export const config = {
  runtime: "edge",
};

const devId = process.env.DEV_ID;

if (!devId) {
  throw new Error("DEV_ID is not set");
}

const handler = async (req: NextRequest, res: NextResponse) => {
  const sessions = await clerkClient.sessions.getSessionList();

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  let newerThan14Days = false;

  if (sessions.length === 0) {
    await SendMessageToDeveloper(
      "No sessions found",
      "No sessions found. Probably should ask Andrew K to see about turning off the War Manager Service.",
      false
    );
    res.ok;
    return;
  }

  ///check to see if any session is newer than 14 days
  sessions.map((session) => {
    const date = new Date(session.updatedAt);

    if (session.userId != devId) {
      console.log(
        date,
        fourteenDaysAgo,
        date > fourteenDaysAgo,
        session.userId
      );
    }

    ///if any session is newer than 14 days, return
    if (date > fourteenDaysAgo && session.userId != devId) {
      newerThan14Days = true;
    }
  });

  if (newerThan14Days) {
    await SendMessageToDeveloper(
      "War Manager Service is still being used",
      "The War Manager Cloud Service is still being used.",
      false
    );

    res.ok;

    return;
  } else {
    await SendMessageToDeveloper(
      "No session is newer than 14 days",
      "No session is newer than 14 days. Probably should ask Andrew K to see about turning off the War Manager Service.",
      false
    );
  }

  res.ok;
};

export default handler;
