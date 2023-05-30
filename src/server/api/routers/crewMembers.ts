import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

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

export const crewMembersRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const crewMembers = await ctx.prisma.crewMember.findMany({
      take: 100,
      orderBy: {
        name: "asc",
      },
    });

    return crewMembers;
  }),

  getById: privateProcedure
    .input(z.object({ crewMemberId: z.string() }))
    .query(async ({ ctx, input }) => {
      const crewMember = await ctx.prisma.crewMember.findUnique({
        where: {
          id: input.crewMemberId,
        },
      });
      return crewMember;
    }),

  getByName: privateProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const crewMembers = await ctx.prisma.crewMember.findMany({
        where: {
          name: input.name,
        },
      });
      return crewMembers;
    }),

  update: privateProcedure
    .input(
      z.object({
        crewMemberId: z.string(),
        name: z.string().min(3).max(255),
        position: z.string().min(3).max(255),
        notes: z.string().min(0).max(255),
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

      const crewMember = await ctx.prisma.crewMember.update({
        where: {
          id: input.crewMemberId,
        },
        data: {
          name: input.name,
          position: input.position,
          description: input.notes,
        },
      });

      return crewMember;
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z.string().min(3).max(255),
        position: z.string().min(3).max(255),
        notes: z.string().min(0).max(255),
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

      const crewMember = await ctx.prisma.crewMember.create({
        data: {
          authorId,
          name: input.name,
          position: input.position,
          description: input.notes,
        },
      });

      return crewMember;
    }),

  delete: privateProcedure
    .input(z.object({ crewMemberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const crewMember = await ctx.prisma.crewMember.delete({
        where: {
          id: input.crewMemberId,
        },
      });

      return crewMember;
    }),
});
