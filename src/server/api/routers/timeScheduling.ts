import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";
const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export const timeSchedulingRouter = createTRPCRouter({
  /*
   *   SCHEDULE HISTORY SETS
   */

  getTimeScheduleById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        searchTerm: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const filters: Prisma.ScheduleHistoryItemWhereInput = {};

      if (input.searchTerm !== undefined && input.searchTerm?.length > 3) {
        filters.OR = [
          {
            crew: {
              name: {
                contains: input.searchTerm,
              },
            },
          },
          {
            crew: {
              position: {
                contains: input.searchTerm,
              },
            },
          },
          {
            crew: {
              phone: {
                contains: input.searchTerm,
              },
            },
          },
          {
            project: {
              name: {
                contains: input.searchTerm,
              },
            },
          },
          {
            project: {
              address: {
                contains: input.searchTerm,
              },
            },
          },
          {
            project: {
              state: {
                contains: input.searchTerm,
              },
            },
          },
          {
            project: {
              city: {
                contains: input.searchTerm,
              },
            },
          },
        ];
      }

      const result = await ctx.prisma.scheduleHistory.findFirst({
        where: {
          id: input.id,
        },
        select: {
          createdAt: true,
          defaultStartDate: true,
          defaultEndDate: true,
        },
      });

      const scheduleItems = await ctx.prisma.scheduleHistoryItem.findMany({
        where: {
          AND: [
            {
              scheduleHistoryId: input.id,
            },
            {
              ...filters,
            },
          ],
        },
        select: {
          project: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
            },
          },
          crew: {
            select: {
              id: true,
              name: true,
              phone: true,
              position: true,
            },
          },
          equipment: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          startTime: true,
          endTime: true,
        },
      });

      return {
        ...result,
        ScheduleHistoryItems: scheduleItems,
      };
    }),

  getTimeSchedulesByBlueprintId: privateProcedure
    .input(
      z.object({
        blueprintId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.scheduleHistory.findMany({
        where: {
          blueprintId: input.blueprintId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return result;
    }),
  deleteTimeSchedules: privateProcedure
    .input(
      z.object({
        id: z.string(),
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

      const result = await ctx.prisma.$transaction([
        ctx.prisma.scheduleHistoryItem.deleteMany({
          where: {
            scheduleHistoryId: input.id,
          },
        }),
        ctx.prisma.scheduleHistory.delete({
          where: {
            id: input.id,
          },
        }),
      ]);

      return result;
    }),

  /*
   *   SCHEDULE ITEMS
   */

  saveTimeSchedules: privateProcedure
    .input(
      z
        .object({
          id: z.string(),
          startTime: z.string(),
          endTime: z.string(),
          projectId: z.string(),
          crewMemberId: z.string(),
          notes: z.string(),
        })
        .array()
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

      const result = ctx.prisma.scheduleHistoryItem.updateMany({
        where: {
          id: {
            in: input.map((item) => item.id),
          },
        },
        data: input,
      });

      return result;
    }),

  updateTimeSchedules: privateProcedure
    .input(
      z
        .object({
          id: z.string(),
          startTime: z.string(),
          endTime: z.string(),
          projectId: z.string(),
          crewId: z.string().optional(),
          equipmentId: z.string().optional(),
          notes: z.string(),
        })
        .array()
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

      const result = input.map(async (item) => {
        const result = await ctx.prisma.scheduleHistoryItem.update({
          where: {
            id: item.id,
          },
          data: {
            startTime: item.startTime,
            endTime: item.endTime,
            projectId: item.projectId,
            crewId: item.crewId,
            equipmentId: item.equipmentId,
            notes: item.notes,
          },
        });

        return result;
      });

      return result;
    }),
});
