import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";

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
        }
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
      });

      if (!log) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Log not found",
        });
      }

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
      });

      if (!log) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Log not found",
        });
      }

      const logReply = await ctx.prisma.logReply.update({
        where: {
          id: input.id,
        },
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

      return logReply;
    }),
});
