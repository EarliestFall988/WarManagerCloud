import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { type Prisma } from "@prisma/client";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export const EquipmentRouter = createTRPCRouter({
  createEquipment: privateProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(
            3,
            "An equipment item must have a name that is at least 3 characters long"
          )
          .max(
            255,
            "An equipment item must have a name that is less than 255 characters long"
          ),
        identification: z.string().optional(),
        tags: z.array(z.string().min(3).max(255)),
        sectors: z
          .array(z.string())
          .min(1, "A member must be assigned a sector.")
          .max(1, "A member cannot be assigned more than one sector."),
        condition: z.string().min(3).max(255),
        type: z.string().min(3).max(255),
        gpsURL: z.string().optional(),
        costPerHour: z.number().min(0),
        notes: z.string().min(3).max(255),
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

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      if (!input.sectors || input.sectors.length < 1 || !input.sectors[0]) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A crew member must belong to a sector.",
        });
      }

      const sector = input.sectors[0];

      const equipment = await ctx.prisma.equipment.create({
        data: {
          name: input.name,
          equipmentId: input.identification,
          condition: input.condition,
          type: input.type,
          gpsURL: input.gpsURL ?? "",
          sectorId: sector,
          costPerHour: input.costPerHour,
          description: input.notes,
          authorId: authorId,
          tags: {
            connect: input.tags?.map((tag) => ({
              id: tag,
            })),
          },
        },
      });

      return equipment;
    }),

  search: privateProcedure
    .input(
      z.object({
        search: z.string(),
        filter: z.array(z.string()),
        sectors: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      const filters: Prisma.EquipmentWhereInput = {};

      if (input.sectors.length > 0) {
        filters.sectorId = {
          in: input.sectors,
        };
      }

      if (input.search.length > 0) {
        filters.OR = [
          {
            name: {
              contains: input.search,
            },
          },
          {
            equipmentId: {
              contains: input.search,
            },
          },
          {
            type: {
              contains: input.search,
            },
          },
          {
            condition: {
              contains: input.search,
            },
          },
          {
            description: {
              contains: input.search,
            },
          },
        ];
      }

      if (input.sectors.length > 0) {
        filters.sector = {
          id: {
            in: input.sectors,
          },
        };
      }

      const result = await ctx.prisma.equipment.findMany({
        where: filters,
        include: {
          tags: true,
          sector: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return result;
    }),

  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const equipment = await ctx.prisma.equipment.findUnique({
        where: {
          id: input.id,
        },
        include: {
          tags: true,
          sector: true,
        },
      });

      return equipment;
    }),
  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z
          .string()
          .min(
            3,
            "An equipment item must have a name that is at least 3 characters long"
          )
          .max(
            255,
            "An equipment item must have a name that is less than 255 characters long"
          ),
        identification: z.string().optional(),
        tags: z.array(z.string().min(3).max(255)),
        sectors: z
          .array(z.string())
          .min(1, "A member must be assigned a sector.")
          .max(1, "A member cannot be assigned more than one sector."),
        condition: z.string().min(3).max(255),
        type: z.string().min(3).max(255),
        gpsURL: z.string().optional(),
        costPerHour: z.number().min(0),
        notes: z.string().min(3).max(255),
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

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      if (!input.sectors || input.sectors.length < 1 || !input.sectors[0]) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A crew member must belong to a sector.",
        });
      }

      const sector = input.sectors[0];

      const equipment = await ctx.prisma.equipment.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          equipmentId: input.identification,
          condition: input.condition,
          type: input.type,
          gpsURL: input.gpsURL ?? "",
          sectorId: sector,
          costPerHour: input.costPerHour,
          description: input.notes,
          authorId: authorId,
          tags: {
            connect: input.tags?.map((tag) => ({
              id: tag,
            })),
          },
        },
      });

      return equipment;
    }),
});
