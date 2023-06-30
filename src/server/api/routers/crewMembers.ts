import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";

import isMobilePhone from "validator/lib/isMobilePhone";

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
      include: {
        tags: true,
      },
    });

    return crewMembers;
  }),

  download: privateProcedure.query(async ({ ctx }) => {
    const crewMembers = await ctx.prisma.crewMember.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return crewMembers;
  }),

  search: privateProcedure
    .input(
      z.object({
        search: z.string().min(0).max(255),
        filter: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      if (input.search.length < 3 && input.filter.length === 0) {
        const crewMembers = await ctx.prisma.crewMember.findMany({
          take: 30,
          orderBy: {
            name: "asc",
          },
          include: {
            tags: true,
          },
        });
        return crewMembers;
      }

      if (input.search.length < 3 && input.filter.length > 0) {
        const crewMembers = await ctx.prisma.crewMember.findMany({
          take: 30,
          orderBy: {
            name: "asc",
          },
          include: {
            tags: true,
          },
          where: {
            tags: {
              some: {
                id: {
                  in: input.filter,
                },
              },
            },
          },
        });
        return crewMembers;
      }

      if (input.search.length > 2 && input.filter.length > 0) {
        const crewMembers = await ctx.prisma.crewMember.findMany({
          take: 30,
          where: {
            AND: [
              {
                OR: [
                  {
                    name: {
                      contains: input.search,
                    },
                  },
                  {
                    position: {
                      contains: input.search,
                    },
                  },
                ],
              },
              {
                tags: {
                  some: {
                    id: {
                      in: input.filter,
                    },
                  },
                },
              },
            ],
          },
          include: {
            tags: true,
          },
          orderBy: {
            name: "asc",
          },
        });

        return crewMembers;
      }

      if (input.search.length > 2 && input.filter.length == 0) {
        const crewMembers = await ctx.prisma.crewMember.findMany({
          take: 30,
          where: {
            OR: [
              {
                name: {
                  contains: input.search,
                },
              },
              {
                position: {
                  contains: input.search,
                },
              },
            ],
          },
          include: {
            tags: true,
          },
          orderBy: {
            name: "asc",
          },
        });

        return crewMembers;
      }
    }),

  getById: privateProcedure
    .input(z.object({ crewMemberId: z.string() }))
    .query(async ({ ctx, input }) => {
      const crewMember = await ctx.prisma.crewMember.findUnique({
        where: {
          id: input.crewMemberId,
        },
        include: {
          tags: true,
        },
      });
      return crewMember;
    }),

  getByName: privateProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const crewMembers = await ctx.prisma.crewMember.findMany({
        where: {
          name: {
            contains: input.name,
          },
        },
        include: {
          tags: true,
        },
      });
      return crewMembers;
    }),

  update: privateProcedure
    .input(
      z.object({
        crewMemberId: z.string({ required_error: "Crew member ID is required." }),
        name: z.string({ required_error: "Crew member name is required." }).min(3, "A crew member's name must be at least 3 characters long.").max(255, "A crew member's name cannot be longer than 255 characters."),
        position: z.string({ required_error: "A crew member's position is required." }).min(3, "A crew member must have a position").max(255, "The position name is too long."),
        notes: z.string().min(0).max(255, "Crew member notes must be less than 255 characters.").optional(),
        phone: z.string({ required_error: "Phone Number is required." }).refine(isMobilePhone, "The phone number is invalid."),
        email: z.string({ required_error: "Email is required." }).email("The email is invalid.").max(255, "Email must be less than 255 characters."),
        tags: z.array(z.string()),
        wage: z.number({ required_error: "A crew member must have a wage" }).min(0, "The wage must be a positive number.").max(1000000, "The wage must be less than 1000000."),
        burden: z.number({ required_error: "A crew member must have burden" }).min(0, "The burden must be a positive number.").max(1000000, "The burden must be less than 1000000."),
        rating: z.number({ required_error: "A rating has not been assigned to the crew member" }).min(0, "The rating must be a value greater than or equal to zero.").max(10, "The rating must be less than or equal to 10."),
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

      const tagsToDisconnect = await ctx.prisma.project
        .findUnique({
          where: {
            id: input.crewMemberId,
          },
        })
        .tags();

      const disconnectTags = tagsToDisconnect || [];


      const crewMember = await ctx.prisma.crewMember.update({
        where: {
          id: input.crewMemberId,
        },
        data: {
          name: input.name.trim(),
          position: input.position.trim(),
          description: input.notes?.trim(),
          phone: input.phone.trim(),
          email: input.email.trim(),
          wage: input.wage,
          burden: input.burden,
          rating: input.rating.toString().trim(),

          tags: {
            disconnect: disconnectTags?.map((tag) => ({
              id: tag.id,
            })),

            connect: input.tags?.map((tag) => ({
              id: tag,
            })),
          },
        },
      });

      return crewMember;
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z.string({ required_error: "Crew member name is required." }).min(3, "A crew member's name must be at least 3 characters long.").max(255, "A crew member's name cannot be longer than 255 characters."),
        position: z.string({ required_error: "A crew member's position is required." }).min(3, "A crew member must have a position").max(255, "The position name is too long."),
        notes: z.string().min(0).max(255, "Crew member notes must be less than 255 characters.").optional(),
        phone: z.string({ required_error: "Phone Number is required." }).refine(isMobilePhone, "The phone number is invalid."),
        email: z.string({ required_error: "Email is required." }).email("The email is invalid.").max(255, "Email must be less than 255 characters."),
        tags: z.array(z.string()),
        wage: z.number({ required_error: "A crew member must have a wage" }).min(0, "The wage must be a positive number.").max(1000000, "The wage must be less than 1000000."),
        burden: z.number({ required_error: "A crew member must have burden" }).min(0, "The burden must be a positive number.").max(1000000, "The burden must be less than 1000000."),
        rating: z.number({ required_error: "A rating has not been assigned to the crew member" }).min(0, "The rating must be a value greater than or equal to zero.").max(10, "The rating must be less than or equal to 10."),
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

      const FoundCrewMember = await ctx.prisma.crewMember.findFirst({
        where: {
          name: input.name.trim(),
        },
      });

      if (FoundCrewMember) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A crew member with this name already exists.",
        });
      }

      const crewMember = await ctx.prisma.crewMember.create({
        data: {
          authorId,
          name: input.name.trim(),
          position: input.position.trim(),
          description: input.notes?.trim() || "",

          phone: input.phone.trim(),
          email: input.email.trim(),
          skills: "",
          rating: input.rating.toString().trim(),
          lastReviewDate: new Date(),

          wage: input.wage,
          burden: input.burden,
          travel: "",
          rate: 0,
          hours: 0,
          total: 0,
          tags: {
            connect: input.tags?.map((tag) => ({
              id: tag,
            })),
          },
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
