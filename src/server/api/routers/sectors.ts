import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export const sectorsRouter = createTRPCRouter({
  getbyId: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const sector = await ctx.prisma.sector.findUnique({
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              CrewMembers: true,
              Projects: true,
            },
          },
        },
      });

      return sector;
    }),

  getByName: privateProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const filters: Prisma.SectorWhereInput = {};

      if (input.name) {
        filters.OR = [
          {
            name: {
              contains: input.name,
            },
          },
          {
            description: {
              contains: input.name,
            },
          },
          {
            departmentCode: {
              contains: input.name,
            },
          },
        ];
      }

      const sectors = await ctx.prisma.sector.findMany({
        where: filters,
        include: {
          _count: {
            select: {
              CrewMembers: true,
              Projects: true,
            },
          },
        },
        orderBy: {
          departmentCode: "asc",
        },
      });

      return sectors;
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, "Name must be at least 3 characters long")
          .max(50, "Name must be at most 50 characters long"),
        description: z.string(),
        departmentCode: z
          .string()
          .min(2, "Code must be at least 2 characters long")
          .max(10, "Code must be at most 10 characters long"),
        color: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      if (!authorId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to create a sector",
        });
      }

      const sectorExists = await ctx.prisma.sector.findFirst({
        where: {
          OR: [
            {
              name: {
                equals: input.name,
              },
            },
            {
              departmentCode: {
                equals: input.departmentCode,
              },
            },
          ],
        },
      });

      if (sectorExists) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A sector with the name and/or code already exists",
        });
      }

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const sector = await ctx.prisma.sector.create({
        data: {
          name: input.name,
          description: input.description,
          departmentCode: input.departmentCode,
          authorId,
        },
      });

      return sector;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z
          .string()
          .min(3, "Name must be at least 3 characters long")
          .max(50, "Name must be at most 50 characters long"),
        description: z.string(),
        departmentCode: z
          .string()
          .min(2, "Code must be at least 2 characters long")
          .max(10, "Code must be at most 10 characters long"),
        color: z.string(),
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

      const sector = await ctx.prisma.sector.update({
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              CrewMembers: true,
              Projects: true,
            },
          },
        },
        data: {
          name: input.name,
          description: input.description,
          departmentCode: input.departmentCode,
          authorId,
        },
      });

      return sector;
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

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const getSector = await ctx.prisma.sector.findUnique({
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              CrewMembers: true,
              Projects: true,
            },
          },
        },
      });

      if (
        getSector?._count.CrewMembers !== 0 ||
        getSector?._count.Projects !== 0
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot delete a sector with crew members or projects",
        });
      }

      const sector = await ctx.prisma.sector.delete({
        where: {
          id: input.id,
        },
      });

      await ctx.prisma.log.create({
        data: {
          action: "none",
          category: "crew",
          name: `Deleted Sector ${sector.name}`,
          authorId: authorId,
          url: `/#`,
          description: `${email} deleted sector ${sector.name} (department ${sector.departmentCode})`,
          severity: "critical",
        },
      });

      return sector;
    }),
});
