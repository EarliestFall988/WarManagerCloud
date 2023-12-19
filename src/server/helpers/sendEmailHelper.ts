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

  const uniqueIds = [...new Set(clerkAuthorIds)];

  const users = (await clerkClient.users.getUserList())
    .filter((user) => {
      return uniqueIds.find((id) => id === user.id);
    })
    .map((user) => {
      return {
        ...user,
        emailAddress: user.emailAddresses[0]?.emailAddress,
      };
    })
    .filter((user) => user.emailAddress !== undefined);

  const onlySendOutToTestEmail = false;

  if (apiKey !== null && apiKey !== undefined && users.length > 0) {
    const content = users.map((user) => {
      const receiverAddress = (process.env.VERSION_TYPE =
        "DEV" && onlySendOutToTestEmail
          ? "taylor.howell@jrcousa.com"
          : `${user.emailAddress || ""}`);

      return {
        to: receiverAddress,
        subject,
        content: message || "You have a new notification",
        cta: cta || "View Activity",
        link: link || `https://cloud.warmanager.net/dashboard/activity`,
        personalName: user?.firstName || undefined,
      };
    });

    // console.log(content);

    await fetch("https://wm-messaging-service.vercel.app/api/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: apiKey,
        content: content.filter((c) => c !== undefined && c !== null),
      }),
    }).then((res) => console.log(res));
  }
};

export const SendMessageToDeveloper = async (
  title: string,
  message: string,
  helpPage?: boolean
) => {
  console.log("sending message to developer");

  const apiKey = process.env.MSG_API_KEY;

  if (apiKey === undefined) {
    throw new Error("API Key is undefined");
  }

  let subject = `Someone sent you a message from the \'send a quick message\' in the help page: ${title}`;

  if (!helpPage) {
    subject = title;
  }

  const content = [
    {
      to: "taylor.howell@jrcousa.com",
      subject: subject,
      content: message,
      cta: "View Activity",
      link: `https://cloud.warmanager.net/dashboard/activity`,
      personalName: "",
    },
  ];

  // console.log(content);

  const result = await fetch(
    "https://wm-messaging-service.vercel.app/api/v1/email",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: apiKey,
        content: content.filter((c) => c !== undefined && c !== null),
      }),
    }
  ).then((res) => console.log(res));

  return result;
};

export const HandleMentions = async (text: string, logId: string) => {
  const mentionRegex = /(^|[ ])@([\w])(([-\w])+)?/m;

  const stringTokens = text.split(" ");

  const companyEmailDomain = process.env.COMPANY_EMAIL_DOMAIN;

  if (companyEmailDomain === undefined) {
    throw new Error("Company email domain is undefined");
  }

  const mentions = [] as string[];

  stringTokens.forEach((token) => {
    const result = token.match(mentionRegex);

    if (result) {
      mentions.push(result[0]);
    }
  });

  console.log(mentions);

  const emails = mentions.map((mention) => {
    const emailName =
      mention.substring(1, mention.length).replace("-", ".") +
      "@" +
      companyEmailDomain;
    return emailName;
  });

  const users = await clerkClient.users.getUserList();

  const userIds = users
    .filter((user) => {
      const emailAddress = user.emailAddresses[0]?.emailAddress;

      let found = false;

      if (emailAddress !== null && emailAddress !== undefined) {
        emails.find((email) => {
          console.log("email", `\'${email}\'`, `\'${emailAddress}\'`);
          if (email === emailAddress) {
            console.log("found email", email, emailAddress);
            found = true;
          }
        });
      }

      return found;
    })
    .map((user) => {
      return user.id;
    });

  // console.log("user ids", userIds);

  const messageToShow = text.length > 40 ? text.substring(0, 40) + "..." : text;

  console.log("message to show", messageToShow);

  const emailSendResult = await SendCTAEmail(
    userIds,
    "Someone Mentioned You",
    `It looks like someone mentioned you in a post: \"${messageToShow}\" Click the button below to view the post.`,
    "View Post",
    `https://cloud.warmanager.net/dashboard/activity?search=${logId}`
  );
};
