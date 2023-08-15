import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import * as client from "twilio";

const accountSid = process.env.TWILIO_ACCT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export const messagingRouter = createTRPCRouter({
  sendMessage: privateProcedure
    .input(
      z.object({
        message: z.string(),
        phoneNumber: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      if (!accountSid || !authToken || !phoneNumber) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Twilio is not configured",
        });
      }

      const message =
        input.message +
        "\n\n (War Manager) \n" +
        "https://cloud.warmanager.net/dashboard/activity/";

      console.log(message);

      let messagingResult = "";

      const res = await new client.Twilio(accountSid, authToken).messages
        .create({
          body:
            input.message + "https://cloud.warmanager.net/dashboard/activity/",
          from: phoneNumber,
          to: input.phoneNumber,
        })
        .then((result) => {
          console.log(result);
          messagingResult = JSON.stringify(result.toJSON());
        })
        .catch((error) => {
          messagingResult = JSON.stringify(error);
        });

      const result = await ctx.prisma.messagingContent.create({
        data: {
          authorId,
          content: messagingResult,
          type: "text message",
        },
      });

      return result;
    }),
});
