import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs";
import { type LogReaction } from "@prisma/client";
import filterUserForClient from "~/server/helpers/filterUserForClient";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

const addUserToReactions = async (reactions: LogReaction[]) => {

  const users = await clerkClient.users
    .getUserList()
    .then((users) => {
      return users;
    })
    .catch((err) => {
      console.log(err);
    });

  if (!users)
    return reactions.map((log) => {
      return {
        ...log,
        user: null,
      };
    });

  const usersWithReactions = reactions.map((log) => {
    const user = users.find((user) => {
      return user.id === log.authorId;
    });

    if (!user) {
      return {
        ...log,
        user: null,
      };
    }

    return {
      ...log,
      user: filterUserForClient(user),
    };
  });

  // if (env.VERSION_TYPE !== "dev") {
  //   usersWithLinks.filter((log) => {
  //     if (log.user?.email !== "taylor.howell@jrcousa.com") {
  //       return true;
  //     }
  //     return false;
  //   });
  // }

  return usersWithReactions;
};

export const reactionsRouter = createTRPCRouter({
  createReaction: privateProcedure
    .input(
      z.object({
        reaction: z.string(),
        logId: z.string(),
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
          logReactions: true,
        },
      });

      if (!log) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Log not found",
        });
      }

      const myLogReaction = log.logReactions.find(
        (logReaction) => logReaction.authorId === authorId
      );

      if (myLogReaction !== null && myLogReaction !== undefined) {
        await ctx.prisma.logReaction.update({
          where: {
            id: myLogReaction.id,
          },
          data: {
            reaction: input.reaction,
          },
        });

        return myLogReaction;
      }

      const reaction = await ctx.prisma.logReaction.create({
        data: {
          authorId: authorId,
          reaction: input.reaction,
          log: {
            connect: {
              id: input.logId,
            },
          },
        },
      });

      return reaction;
    }),

  getReactionsByLogId: privateProcedure
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
          logReactions: true,
        },
      });

      return addUserToReactions(log?.logReactions ?? [] as LogReaction[]);
    }),

  deleteReaction: privateProcedure
    .input(
      z.object({
        id: z.string(),
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

      const logReaction = await ctx.prisma.logReaction.delete({
        where: {
          id: input.id,
        },
      });

      return logReaction;
    }),
});