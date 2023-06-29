import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export const blueprintsRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const blueprints = await ctx.prisma.blueprint.findMany({
      take: 100,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return blueprints;
  }),

  search: privateProcedure
    .input(
      z.object({
        search: z.string().min(0).max(255),
      })
    )
    .query(async ({ ctx, input }) => {
      if (input.search.length < 3) {
        const blueprints = await ctx.prisma.blueprint.findMany({
          take: 100,
          orderBy: {
            updatedAt: "desc",
          },
        });
        return blueprints;
      }

      const blueprints = await ctx.prisma.blueprint.findMany({
        take: 100,
        where: {
          name: {
            contains: input.search,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return blueprints;
    }),

  getOneById: privateProcedure
    .input(z.object({ blueprintId: z.string() }))
    .query(async ({ ctx, input }) => {
      const blueprint = await ctx.prisma.blueprint.findUnique({
        where: {
          id: input.blueprintId,
        },
      });

      return blueprint;
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z.string().min(3).max(255),
        description: z.string().min(0).max(255),
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

      const blueprint = await ctx.prisma.blueprint.create({
        data: {
          name: input.name,
          authorId,
          description: input.description,
          data: "{}",
        },
      });

      return blueprint;
    }),

  save: privateProcedure
    .input(
      z.object({
        blueprintId: z.string(),
        flowInstanceData: z.string().min(0).max(100000),
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

      const blueprint = await ctx.prisma.blueprint.update({
        where: {
          id: input.blueprintId,
        },
        data: {
          data: input.flowInstanceData,
        },
      });

      return blueprint;
    }),

  updateDetails: privateProcedure
    .input(
      z.object({
        blueprintId: z.string(),
        name: z.string().min(3).max(255),
        description: z.string().min(0).max(255),
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

      const blueprint = await ctx.prisma.blueprint.update({
        where: {
          id: input.blueprintId,
        },
        data: {
          name: input.name,
          description: input.description,
        },
      });

      return blueprint;
    }),

  delete: privateProcedure
    .input(z.object({ blueprintId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const blueprint = await ctx.prisma.blueprint.delete({
        where: {
          id: input.blueprintId,
        },
      });

      return blueprint;
    }),
});
