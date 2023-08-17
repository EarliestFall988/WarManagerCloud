import { clerkClient } from "@clerk/nextjs";

export const SendCTAEmail = async (
  clerkAuthorIds: string[],
  subject: string,
  message: string,
  cta?: string,
  link?: string,
  sender?: string,
  filterOutSender?: boolean
) => {
  const apiKey = process.env.MSG_API_KEY;

  if (sender !== undefined && filterOutSender === true) {
    clerkAuthorIds = clerkAuthorIds.filter((id) => id !== sender);
  }

  const users = (await clerkClient.users.getUserList())
    .filter((user) => {
      return clerkAuthorIds.find((id) => id === user.id);
    })
    .map((user) => {
      return {
        ...user,
        emailAddress: user.emailAddresses[0]?.emailAddress,
      };
    })
    .filter((user) => user.emailAddress !== undefined);

  if (apiKey !== null && apiKey !== undefined && users.length > 0) {
    const content = users.map((user) => {
      return {
        to: user.emailAddress,
        subject,
        content: message || "You have a new notification",
        cta: cta || "View Activity",
        link: link || `https://cloud.warmanager.net/dashboard/activity`,
        personalName: user?.firstName || undefined,
      };
    });

    await fetch("https://wm-messaging-service.vercel.app/api/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: apiKey,
        content,
      }),
    }).then((res) => console.log(res));
  }
};
