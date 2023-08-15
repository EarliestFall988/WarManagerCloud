import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { TRPCError } from "@trpc/server";
import * as mail from "@sendgrid/mail";
import { render } from "@react-email/render";
import { Template } from "../../helpers/_emailTemplateComponent";
import { clerkClient } from "@clerk/nextjs";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export const emailSenderRouter = createTRPCRouter({
  sendEmail: privateProcedure
    .input(
      z.object({
        subject: z.string(),
        content: z.string(),
        callToAction: z.string(),
        link: z.string(),
        to: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = await sendEmail(input, ctx);
      return res;
    }),
});

type inputType = {
  link: string;
  subject: string;
  content: string;
  callToAction: string;
  to: string;
};

type ctxType = {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  userId: string | null;
  currentUser: string;
};

export const sendEmail = async (input: inputType, ctx: ctxType) => {
  const authorId = ctx.currentUser;

  const { success } = await rateLimit.limit(authorId);

  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "You have exceeded the rate limit, try again in a minute",
    });
  }

  const apiKey = process.env.TWILIO_EMAIL_API;

  if (apiKey === undefined)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No API key found",
    });

  mail.setApiKey(apiKey);

  const users = await clerkClient.users.getUserList();

  const user = users.find((x) => {
    const emailToCompare = x.emailAddresses[0]?.emailAddress;
    return emailToCompare === input.to;
  });

  let name = user?.firstName;
  if (name === undefined || name === null) name = "";

  const html = render(
    <Template
      callToActionTitle={input.callToAction}
      content={input.content}
      link={input.link}
      recipient={input.to}
      title={input.subject}
      name={name}
    />,
    {
      pretty: true,
    }
  );

  const text = render(
    <Template
      callToActionTitle={input.callToAction}
      content={input.content}
      link={input.link}
      recipient={input.to}
      title={input.subject}
      name={name}
    />,
    {
      plainText: true,
    }
  );

  const msg = {
    to: input.to,
    from: "taylor.howell@jrcousa.com",
    subject: input.subject + " | War Manager",
    text,
    html,
  };

  let messagingResult = "";

  const emailResult = await mail
    .send(msg)
    .then((result) => {
      messagingResult = JSON.stringify(result);
    })
    .catch((error) => {
      messagingResult = JSON.stringify(error);
    });

  const res = await ctx.prisma.messagingContent.create({
    data: {
      authorId,
      content: messagingResult,
      type: "email",
    },
  });

  return res;
};
