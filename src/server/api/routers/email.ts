import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { TRPCError } from "@trpc/server";
import * as mail from "@sendgrid/mail";

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
        from: z.string(),
        subject: z.string(),
        html: z.string(),
        text: z.string(),
        to: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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

      const msg = {
        to: input.to,
        from: input.from,
        subject: input.subject,
        text: input.text,
        html: input.html,
      };

      const result = await mail
        .send(msg)
        .then(() => {
          console.log("Message sent");
          return true;
        })
        .catch((error) => {
          console.error(error);
          return false;
        });

      return result;
    }),
});
