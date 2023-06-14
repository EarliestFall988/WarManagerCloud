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
      include: {
        tags: true,
      },
    });
    return projects;
  }),

  download: privateProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return projects;
  }),

  search: privateProcedure
    .input(z.object({ search: z.string().min(0).max(255), filter: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {

      if (input.search.length < 3 && input.filter.length === 0) {
        const projects = await ctx.prisma.project.findMany({
          take: 100,
          orderBy: {
            updatedAt: "desc",
          },
          include: {
            tags: true,
          },
        });
        return projects;
      }

      console.log(input.filter);

      if (input.search.length < 3 && input.filter.length > 0) {
        const projects = await ctx.prisma.project.findMany({
          take: 30,
          orderBy: {
            updatedAt: "desc",
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
        return projects;
      }

      if (input.search.length >= 3 && input.filter.length > 0) {
        const projects = await ctx.prisma.project.findMany({
          take: 30,
          orderBy: {
            updatedAt: "desc",
          },
          include: {
            tags: true,
          },
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
                    jobNumber: {
                      contains: input.search,
                    },
                  },
                  {
                    city: {
                      contains: input.search,
                    },
                  },
                  {
                    state: {
                      contains: input.search,
                    },
                  },
                  {
                    description: {
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
                  },
                },
              },
            ],
          },
        });
        return projects;
      }

      const projects = await ctx.prisma.project.findMany({
        take: 30,
        where: {
          OR: [
            {
              name: {
                contains: input.search,
              },
            },
            {
              jobNumber: {
                contains: input.search,
              },
            },
            {
              city: {
                contains: input.search,
              },
            },
            {
              state: {
                contains: input.search,
              },
            },
            {
              description: {
                contains: input.search,
              },
            },
          ],
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          tags: true,
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
        include: {
          tags: true,
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
        // tags: z.array(z.string()),

        address: z.string().min(3).max(255),
        city: z.string().min(2).max(255),
        state: z.string().min(2).max(2),
        // zip: z.string().min(3).max(255),
        tags: z.array(z.string()),
        estimatedManHours: z.number().min(0).max(1000000),
        startDate: z.date(),
        endDate: z.date(),
        status: z.string().min(3).max(255),
        percentComplete: z.number().min(0).max(100),
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
            id: input.id,
          },
        })
        .tags();

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
          TotalManHours: input.estimatedManHours,
          startDate: input.startDate,
          endDate: input.endDate,
          status: input.status,
          percentComplete: input.percentComplete,
          tags: {

            disconnect: tagsToDisconnect?.map((tag) => ({
              id: tag.id,
            })),

            connect: input.tags?.map((tag) => ({
              id: tag,
            })),
          },
        }
      });

      console.log(project);

      return project;
    }),

  getByNameOrJobCode: privateProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findMany({
        where: {
          OR: [
            {
              jobNumber: {
                contains: input.name,
              },
            },
            {
              name: {
                contains: input.name,
              },
            },
            // {
            //   city: {
            //     contains: input.name,
            //   },
            // },
            // {
            //   state: {
            //     contains: input.name,
            //   },
            // },
            // {
            //   address: {
            //     contains: input.name,
            //   },
            // },
          ],
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
