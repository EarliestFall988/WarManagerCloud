import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs";
import { HandleMentions, SendCTAEmail } from "~/server/helpers/sendEmailHelper";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export const logMessageReplies = createTRPCRouter({
  getRepliesByLogId: privateProcedure
    .input(
      z.object({
        logId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const log = await ctx.prisma.log.findFirst({
        where: {
          id: input.logId,
        },
        include: {
          logReplys: true,
        },
      });

      return log?.logReplys ?? [];
    }),

  createReply: privateProcedure
    .input(
      z.object({
        logId: z.string(),
        message: z.string(),
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

      const log = await ctx.prisma.log.findFirst({
        where: {
          id: input.logId,
        },
        include: {
          logReplys: true,
        },
      });

      if (!log) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Log not found",
        });
      }

      // const reply = log.logReplys.find(
      //   (logReply) => logReply.authorId === authorId && logReply.id === input.id
      // );

      const logReply = await ctx.prisma.logReply.create({
        data: {
          message: input.message,
          authorId: authorId,
          editedMessage: "",
          log: {
            connect: {
              id: input.logId,
            },
          },
        },
      });

      let replyMessage = input.message;

      if (replyMessage.length > 40) {
        replyMessage = replyMessage.substring(0, 40) + "...";
      }

      const type = log.category === "announcement" ? "Post" : "Activity";
      const someone = (await clerkClient.users.getUser(authorId))
        .emailAddresses[0]?.emailAddress;

      const title = `New Reply to your ${type}`;
      const cta = `View ${type}`;

      const message = `${
        someone ? someone : "Someone"
      } replied with \"${replyMessage}\"`;

      const ids = log.logReplys.map((reaction) => reaction.authorId);

      if (process.env.VERSION_TYPE === "DEV") {
        ids.push(log.authorId); // add the author of the log to the list of people to send the email to (for testing purposes)
      }

      // console.log(uniqueIds);

      const sendEmail = SendCTAEmail(
        ids,
        title,
        message,
        cta,
        `https://cloud.warmanager.net/dashboard/activity?search=${input.logId}`,
        log.authorId,
        process.env.VERSION_TYPE !== "DEV"
      );

      await HandleMentions(input.message, logReply.id);

      console.log(sendEmail);

      return logReply;
    }),

  updateReply: privateProcedure
    .input(
      z.object({
        id: z.string(),
        logId: z.string(),
        message: z.string(),
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

      const log = await ctx.prisma.log.findFirst({
        where: {
          id: input.logId,
        },
        include: {
          logReplys: true,
        },
      });

      if (!log) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Log not found",
        });
      }

      const reply = log.logReplys.find(
        (logReply) => logReply.authorId === authorId && logReply.id === input.id
      );

      if (!reply) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reply not found",
        });
      }

      const logReply = await ctx.prisma.logReply.update({
        where: {
          id: input.id,
        },
        data: {
          message: input.message,
          authorId: authorId,
          editedMessage: reply.message,
          log: {
            connect: {
              id: input.logId,
            },
          },
        },
      });

      return logReply;
    }),
});
