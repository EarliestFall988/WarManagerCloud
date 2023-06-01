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

export const projectsRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });
    return projects;
  }),

  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: {
          id: input.id,
        },
      });

      return project;
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z.string().min(3).max(255),
        // jobNumber: z.string().min(3).max(255),
        // notes: z.string().min(3).max(255),
        description: z.string().min(3).max(255),

        // address: z.string().min(3).max(255),
        // city: z.string().min(3).max(255),
        // state: z.string().min(3).max(255),
        // zip: z.string().min(3).max(255),

        // startDate: z.date(),
        // endDate: z.date(),
        // status: z.string().min(3).max(255),
        // percentComplete: z.number(),
        // completed: z.boolean(),

        // laborCost: z.number(),
        // subContractorCost: z.number(),
        // materialCost: z.number(),
        // equipmentCost: z.number(),
        // otherCost: z.number(),

        // safetyRating: z.string().min(3).max(255),
        // qualityRating: z.string().min(3).max(255),
        // staffingRating: z.string().min(3).max(255),
        // profitabilityRating: z.string().min(3).max(255),
        // customerRating: z.string().min(3).max(255),

        // BillDate: z.date(),
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

      const project = await ctx.prisma.project.create({
        data: {
          authorId,
          name: input.name,
          description: input.description,
          jobNumber: "",
          address: "",
          notes: "",

          startDate: new Date(),
          endDate: new Date(),
          status: "",
          percentComplete: 0,
          completed: false,

          laborCost: 0,
          subContractorCost: 0,
          materialCost: 0,
          equipmentCost: 0,
          otherCost: 0,

          safetyRating: "",
          qualityRating: "",
          staffingRating: "",
          profitabilityRating: "",
          customerRating: "",

          BillDate: new Date(),

          city: "",
          state: "",
          zip: "",
        },
      });

      return project;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).max(255),
        jobNumber: z.string().min(5).max(10),
        notes: z.string().min(0).max(255),
        description: z.string().min(0).max(255),

        address: z.string().min(3).max(255),
        city: z.string().min(2).max(255),
        state: z.string().min(2).max(2),
        // zip: z.string().min(3).max(255),

        startDate: z.date(),
        endDate: z.date(),
        status: z.string().min(3).max(255),
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

      const project = await ctx.prisma.project.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
          jobNumber: input.jobNumber,
          address: input.address,
          city: input.city,
          state: input.state,
          // zip: input.zip,

          notes: input.notes,

          startDate: input.startDate,
          endDate: input.endDate,
          status: input.status,
        },
      });

      return project;
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const project = await ctx.prisma.project.delete({
        where: {
          id: input.id,
        },
      });

      return project;
    }),
});
