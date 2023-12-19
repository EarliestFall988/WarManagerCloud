import { clerkClient } from "@clerk/nextjs";
import { type NextResponse, type NextRequest } from "next/server";
import { SendMessageToDeveloper } from "~/server/helpers/sendEmailHelper";

export const config = {
  runtime: "edge",
};

const handler = async (req: NextRequest, res: NextResponse) => {
  const sessions = await clerkClient.sessions.getSessionList();

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  ///check to see if any session is newer than 14 days
  sessions.map(async (session) => {
    const date = new Date(session.updatedAt);

    ///if any session is newer than 14 days, return
    if (date > fourteenDaysAgo) {
      await SendMessageToDeveloper(
        "Session is newer than 14 days",
        "Session is newer than 14 days. Someone has used it in the last two weeks."
      );
      return;
    }
  });

  ///if no session is newer than 14 days, send email to dev

  await SendMessageToDeveloper(
    "No session is newer than 14 days",
    "No session is newer than 14 days. Probably should ask Andrew K to see about turning off the War Manager Service."
  );

  res.ok;
};

export default handler;
