import { z } from "zod";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createTRPCRouter, privateProcedure } from "../trpc";

import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { Guid } from "guid-typescript";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export const ApiKeysRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const apiKeys = await ctx.prisma.apiKey.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return apiKeys;
  }),
  getAllByUserId: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const apiKeys = await ctx.prisma.apiKey.findMany({
        where: {
          authorId: input.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return apiKeys;
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, "The name must be at least 3 characters long.")
          .max(50, "The name is too long."),
        description: z.string(),
        setActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const createKey = Guid.create().toString();

      const apiKey = await ctx.prisma.apiKey.create({
        data: {
          name: input.name,
          description: input.description,
          authorId: authorId,
          setActive: input.setActive,
          permissions: "",
          key: createKey,
        },
      });

      return apiKey;
    }),

  UpdateKey: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        setActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const apiKey = await ctx.prisma.apiKey.update({
        where: {
          id: input.id,
          authorId,
        },
        data: {
          name: input.name,
          description: input.description,
          setActive: input.setActive,
        },
        select: {
          id: true,
          name: true,
          description: true,
          setActive: true,
        },
      });

      return apiKey;
    }),

  setKeyActive: privateProcedure
    .input(
      z.object({
        id: z.string(),
        setActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const apiKey = await ctx.prisma.apiKey.update({
        where: {
          id: input.id,
          authorId,
        },
        data: {
          setActive: input.setActive,
        },
        select: {
          id: true,
          name: true,
          description: true,
          setActive: true,
        },
      });

      return apiKey;
    }),

  delete: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const result = await ctx.prisma.apiKey.delete({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
      });

      return result;
    }),
});
