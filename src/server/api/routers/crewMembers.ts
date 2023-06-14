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

  download: privateProcedure.query(async ({ ctx }) => {
    const crewMembers = await ctx.prisma.crewMember.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return crewMembers;
  }),

  search: privateProcedure
    .input(z.object({ search: z.string().min(0).max(255), filter: z.array(z.string()) }))
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
                }
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
                    }

                  }
                }
              }
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
        tags: z.array(z.string()),
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

      console.log(disconnectTags)
      console.log(input.tags)

      const crewMember = await ctx.prisma.crewMember.update({
        where: {
          id: input.crewMemberId,
        },
        data: {
          name: input.name,
          position: input.position,
          description: input.notes,
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
        name: z.string().min(3).max(255),
        position: z.string().min(3).max(255),
        notes: z.string().min(0).max(255),
        phone: z.string().min(0).max(255),
        email: z.string().min(0).max(255),
        travel: z.boolean(),
        wage: z.number(),
        burden: z.number(),
        rating: z.number(),
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

          phone: input.phone,
          email: input.email,
          travel: input.travel.toString(),
          skills: "",
          rating: "",
          lastReviewDate: new Date(),

          wage: input.wage,
          burden: input.burden,
          rate: 0,
          hours: 0,
          total: 0,
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
