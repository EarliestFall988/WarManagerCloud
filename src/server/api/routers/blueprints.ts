import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export const blueprintsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const blueprints = await ctx.prisma.blueprint.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    return blueprints;
  }),

  getOneById: publicProcedure
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
        nodes: z.array(z.object({})),
        edges: z.array(z.object({})),
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
          nodes: input.nodes,
          edges: input.edges,
          description: input.description,
        },
      });

      return blueprint;
    }),
});
