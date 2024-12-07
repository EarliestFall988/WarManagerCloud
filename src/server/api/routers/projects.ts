import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs";
import { type Prisma } from "@prisma/client";
import { math } from "lib0";

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
      orderBy: [
        {
          updatedAt: "desc",
        },
        {
          name: "asc",
        },
      ],
      include: {
        tags: true,
        sectors: true,
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
    .input(
      z.object({
        search: z.string().min(0).max(255),
        tagsFilter: z.array(z.string()),
        sectorsFilter: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const filters: Prisma.ProjectWhereInput = {};

      if (input.tagsFilter.length > 0) {
        filters.tags = {
          some: {
            id: {
              in: input.tagsFilter,
            },
          },
        };
      }

      if (input.sectorsFilter && input.sectorsFilter.length > 0) {
        filters.sectors = {
          some: {
            id: {
              in: input.sectorsFilter,
            },
          },
        };
      }

      if (input.search) {
        filters.OR = [
          {
            name: {
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
            jobNumber: {
              contains: input.search,
            },
          },
          {
            description: {
              contains: input.search,
            },
          },
          {
            notes: {
              contains: input.search,
            },
          },
        ];
      }

      const result = await ctx.prisma.project.findMany({
        where: filters,
        take: 100,
        orderBy: [
          {
            updatedAt: "desc",
          },
          // {
          //   _relevance: {
          //     fields: [
          //       "name",
          //       "description",
          //       "notes",
          //       "address",
          //       "city",
          //       "state",
          //       "zip",
          //     ],
          //     search: input.search,
          //     sort: "desc",
          //   },
          // },
          {
            name: "asc",
          },
        ],
        include: {
          tags: true,
          sectors: true,
        },
      });

      return result;
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
          sectors: true,
        },
      });

      return project;
    }),

  createMany: privateProcedure
    .input(
      z
        .object({
          jobNumber: z.string(),
          name: z.string(),
          city: z.string(),
          state: z.string(),
          status: z.string(),
          pw: z.boolean(),
          department: z.string(),
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

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      if (email !== "taylor.howell@jrcousa.com") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const pwTag = ctx.prisma.tag.findFirst({
        where: {
          name: "Prevailing Wage",
        },
      });

      const pwTagId = await pwTag
        .then((tag) => tag?.id)
        .catch(() => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Prevailing Wage tag not found",
          });
        });

      if (
        pwTag === null ||
        pwTag === undefined ||
        pwTagId === null ||
        pwTagId === undefined
      )
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Prevailing Wage tag not found",
        });

      const sectors = await ctx.prisma.sector.findMany({
        where: {
          departmentCode: {
            in: input.map((obj) => obj.department),
          },
        },
      });

      const content = input.map((obj) => {
        if (obj !== undefined) {
          const d = obj;

          if (
            d?.jobNumber !== undefined &&
            d?.name !== undefined &&
            d?.city !== undefined &&
            d?.state !== undefined
          ) {
            return {
              authorId,
              name: d.name,
              description: "",
              jobNumber: d.jobNumber,
              address: "",
              notes: "",

              startDate: new Date(),
              endDate: new Date(),
              status: d?.status,
              percentComplete: 1,
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

              city: d.city,
              state: d.state,
              zip: "",
            };
          }
        }

        return {
          authorId,
          name: "",
          description: "",
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
        };
      });

      if (!content) {
        throw new Error("No data");
      }

      const data = content.filter(
        (obj) =>
          obj !== undefined &&
          obj !== null &&
          obj.jobNumber !== undefined &&
          obj.jobNumber !== null &&
          obj.jobNumber !== ""
      );

      const result = await ctx.prisma.project.createMany({
        data,
      });

      const getProjects = await ctx.prisma.project.findMany({
        where: {
          authorId,
        },
      });

      const projects = getProjects.filter(
        (obj) =>
          obj !== undefined &&
          obj !== null &&
          obj.jobNumber !== "" &&
          data.find((d) => d.jobNumber === obj.jobNumber) !== undefined
      );

      for (const obj of projects) {
        const p = input.find((d) => d.jobNumber === obj.jobNumber);

        const sector = sectors.find((d) => d.departmentCode === p?.department);

        if (sector !== undefined) {
          const compare = input.find(
            (d) => d.jobNumber === obj.jobNumber && d.pw === true
          );

          // console.log(obj.jobNumber, compare);

          if (compare) {
            await ctx.prisma.project
              .update({
                where: {
                  id: obj.id,
                },
                data: {
                  tags: {
                    connect: {
                      id: pwTagId,
                    },
                  },
                  sectors: {
                    connect: {
                      id: sector?.id,
                    },
                  },
                },
              })
              .catch((err: Error) => {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: `Error connecting projects to tags ${err.message}`,
                });
              });
          } else {
            await ctx.prisma.project
              .update({
                where: {
                  id: obj.id,
                },
                data: {
                  sectors: {
                    connect: {
                      id: sector?.id,
                    },
                  },
                },
              })
              .catch((err: Error) => {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: `Error connecting projects to tags ${err.message}`,
                });
              });
          }
        }
      }

      return result;
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, "The project name must be at least 3 characters long")
          .max(255, "The project name is too long!"),
        // jobNumber: z.string().min(3).max(255),
        // notes: z.string().min(3).max(255),
        description: z.string().optional(),
        tags: z.array(z.string()),
        sectors: z
          .array(z.string())
          .min(1, "Be sure to add a sector to your project.")
          .max(1, "Currently only one sector can be added to a project."),
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

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const project = await ctx.prisma.project.create({
        data: {
          authorId,
          name: input.name,
          description: input.description || "",
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
          tags: {
            connect: input.tags.map((tag) => ({
              id: tag,
            })),
          },
          sectors: {
            connect: input.sectors.map((sector) => ({
              id: sector,
            })),
          },
        },
        include: {
          tags: true,
          sectors: true,
        },
      });

      await ctx.prisma.log.create({
        data: {
          action: "url",
          category: "project",
          name: `Created new Project \"${input.name}\"`,
          authorId: authorId,
          url: `/projects/${project.id}`,
          description: `${email} created new project \"${input.name}\")`,
          severity: "moderate",
        },
      });

      return project;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z
          .string({ required_error: "Every project must have a name." })
          .min(3, "The name must be more than 3 characters long.")
          .max(
            255,
            "The name of the project must be less than 255 characters long."
          ),
        jobNumber: z
          .string({
            required_error: "Every project must have a project number.",
          })
          .min(5, "The project number must be more than 5 characters long.")
          .max(10, "The project number must be less than 10 characters long."),
        notes: z
          .string()
          .min(0)
          .max(255, "The notes section must be less than 255 characters.")
          .optional(),
        description: z
          .string()
          .min(0)
          .max(255, "The description must be less than 255 characters.")
          .optional(),
        // tags: z.array(z.string()),
        address: z
          .union([
            z
              .string({
                required_error:
                  "The project address is required for each project.",
              })
              .min(
                3,
                "The project address must be more than 3 characters long."
              )
              .max(
                255,
                "The project address must be less than 255 characters long."
              ),
            z.string().length(0),
          ])
          .optional()
          .transform((val) => {
            if (val === undefined || val === null) {
              return "";
            }
          }),
        city: z
          .string({ required_error: "The city is required for each project." })
          .min(2, "The project city name is too short.")
          .max(255, "The city name must be less than 255 characters long."),
        state: z
          .string({
            required_error:
              "The state abbreviation (US) is required for each project.",
          })
          .min(2, "The state abbreviation is too short.")
          .max(2, "The state abbreviation is too long."),
        // zip: z.string().min(3).max(255),
        tags: z.array(z.string()),
        estimatedManHours: z
          .number({ required_error: "Estimated man hours is required." })
          .min(0)
          .max(1000000, "The estimated man hours is too long."),
        startDate: z.date({ required_error: "The start date is required." }),
        endDate: z.date({ required_error: "The end date is required." }),
        status: z
          .string({ required_error: "The project status is required." })
          .min(3, "The project status is too short.")
          .max(
            255,
            "The project status must be less than 255 characters long."
          ),
        percentComplete: z
          .number({ required_error: "Percent completion status is required." })
          .min(0, "The percent complete must be a positive integer.")
          .max(100, "The percent complete must be less than or equal to 100."),
        sectors: z
          .array(z.string())
          .min(1, "Be sure to add a sector to your project.")
          .max(1, "Currently, only one sector is allowed."),
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

      const oldProject = await ctx.prisma.project.findUnique({
        where: {
          id: input.id,
        },
        include: {
          tags: true,
          sectors: true,
        },
      });

      const oldData = {
        ...oldProject,
      };

      const tagsToDisconnect = await ctx.prisma.project
        .findUnique({
          where: {
            id: input.id,
          },
        })
        .tags();

      const sectorsToDisconnect = await ctx.prisma.project
        .findUnique({
          where: {
            id: input.id,
          },
        })
        .sectors();

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
          sectors: {
            disconnect: sectorsToDisconnect?.map((sector) => ({
              id: sector.id,
            })),

            connect: input.sectors?.map((sector) => ({
              id: sector,
            })),
          },
        },
        include: {
          tags: true,
          sectors: true,
        },
      });

      let updatedName = false;
      let updatedDescription = false;
      let updatedJobNumber = false;
      let updatedAddress = false;
      let updatedCity = false;
      let updatedState = false;
      let updatedZip = false;
      let updatedNotes = false;
      let updatedTotalManHours = false;
      let updatedStartDate = false;
      let updatedEndDate = false;
      let updatedStatus = false;
      let updatedPercentComplete = false;
      let updatedTags = false;
      let updatedSectors = false;

      if (oldData.name !== project.name) {
        updatedName = true;
      }

      if (oldData.description !== project.description) {
        updatedDescription = true;
      }

      if (oldData.jobNumber !== project.jobNumber) {
        updatedJobNumber = true;
      }

      if (oldData.address !== project.address) {
        updatedAddress = true;
      }

      if (oldData.city !== project.city) {
        updatedCity = true;
      }

      if (oldData.state !== project.state) {
        updatedState = true;
      }

      if (oldData.zip !== project.zip) {
        updatedZip = true;
      }

      if (oldData.notes !== project.notes) {
        updatedNotes = true;
      }

      if (oldData.TotalManHours !== project.TotalManHours) {
        updatedTotalManHours = true;
      }

      if (oldData.startDate !== project.startDate) {
        updatedStartDate = true;
      }

      if (oldData.endDate !== project.endDate) {
        updatedEndDate = true;
      }

      if (oldData.status !== project.status) {
        updatedStatus = true;
      }

      if (oldData.percentComplete !== project.percentComplete) {
        updatedPercentComplete = true;
      }

      if (oldData.tags?.length !== project.tags?.length) {
        updatedTags = true;
      }

      if (!updatedTags) {
        if (
          oldData.tags?.map((tag) => tag.id).join(", ") !==
          project.tags?.map((tag) => tag.id).join(", ")
        ) {
          updatedTags = true;
        }
      }

      if (oldData.sectors?.length !== project.sectors?.length) {
        updatedSectors = true;
      }

      if (!updatedSectors) {
        if (
          oldData.sectors?.map((sector) => sector.id).join(", ") !==
          project.sectors?.map((sector) => sector.id).join(", ")
        ) {
          updatedSectors = true;
        }
      }

      const updatedFields = [] as string[];

      if (updatedName) {
        updatedFields.push(
          `Name: ${oldData.name || "no name"} -> ${project.name}\n`
        );
      }

      if (updatedDescription) {
        updatedFields.push(
          `Description: ${oldData.description || "no description"} -> ${
            project.description
          }\n`
        );
      }

      if (updatedJobNumber) {
        updatedFields.push(
          `Job Number: ${oldData.jobNumber || "no job number"} -> ${
            project.jobNumber
          }\n`
        );
      }

      if (updatedAddress) {
        updatedFields.push(
          `Address: ${oldData.address || "no address"} -> ${project.address}\n`
        );
      }

      if (updatedCity) {
        updatedFields.push(
          `City: ${oldData.city || "no city"} -> ${project.city}\n`
        );
      }

      if (updatedState) {
        updatedFields.push(
          `State: ${oldData.state || "no state"} -> ${project.state}\n`
        );
      }

      if (updatedZip) {
        updatedFields.push(
          `Zip: ${oldData.zip || "no zip"} -> ${project.zip}\n`
        );
      }

      if (updatedNotes) {
        updatedFields.push(
          `Notes: ${oldData.notes || "no notes"} -> ${project.notes}\n`
        );
      }

      if (updatedTotalManHours) {
        updatedFields.push(
          `Total Man Hours: ${oldData.TotalManHours || 0} -> ${
            project.TotalManHours
          }\n`
        );
      }

      if (updatedStartDate) {
        updatedFields.push(
          `Start Date: ${
            oldData.startDate?.toDateString() || "no start date"
          } -> ${project.startDate.toDateString()}\n`
        );
      }

      if (updatedEndDate) {
        updatedFields.push(
          `End Date: ${
            oldData.endDate?.toDateString() || "no end date"
          } -> ${project.endDate.toDateString()}\n`
        );
      }

      if (updatedStatus) {
        updatedFields.push(
          `Status: ${oldData.status || "no status"} -> ${project.status}\n`
        );
      }

      if (updatedPercentComplete) {
        updatedFields.push(
          `Percent Complete: ${oldData.percentComplete || 0} -> ${
            project.percentComplete
          }\n`
        );
      }

      if (updatedTags) {
        updatedFields.push(
          `Tags: ${
            oldData.tags?.map((tag) => tag.name).join(", ") || "no tags"
          } -> ${project.tags?.map((tag) => tag.name).join(", ")}\n`
        );
      }

      if (updatedSectors) {
        updatedFields.push(
          `Sectors: ${
            oldData.sectors?.map((sector) => sector.name).join(", ") ||
            "no sectors"
          } -> ${project.sectors?.map((sector) => sector.name).join(", ")}\n`
        );
      }

      const len = updatedFields.length;

      await ctx.prisma.log.create({
        data: {
          action: "url",
          category: "project",
          name: `Updated Project \"${project.name}\"`,
          authorId: authorId,
          url: `/projects/${project.id}`,
          description: `${len} ${
            len == 1 ? "change" : "changes"
          } made to project \"${project.name}\":\n ${updatedFields.join(" ")}`,
          severity: "moderate",
        },
      });

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
        include: {
          tags: true,
          sectors: true,
        },
        orderBy: [
          {
            updatedAt: "desc",
          },
          {
            name: "asc",
          },
        ],
      });

      return project;
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

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

      await ctx.prisma.log.create({
        data: {
          action: "none",
          category: "project",
          name: `Deleted Project \"${project.name}\"`,
          authorId: authorId,
          url: `/#`,
          description: `${email} deleted crew member \"${project.name}\"`,
          severity: "critical",
        },
      });

      return project;
    }),

  deleteMany: privateProcedure.mutation(async ({ ctx }) => {
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

    if (email !== "taylor.howell@jrcousa.com") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to perform this action",
      });
    }

    await ctx.prisma.project.deleteMany();
  }),

  projectManHoursRangeCount: privateProcedure
    .input(
      z.object({
        monthCount: z.number().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const filters = {} as Prisma.ProjectWhereInput;

      // if (input.sectorId) {
      //   filters.sectors = {
      //     some: {
      //       id: input.sectorId,
      //     },
      //   };
      // }

      // filters.startDate = {
      //   lte: input.endDate,
      // };

      // filters.endDate = {
      //   gte: input.startDate,
      // };

      const sectors = await ctx.prisma.sector.findMany();

      const projects = await ctx.prisma.project.findMany({
        where: filters,
        select: {
          id: true,
          name: true,
          jobNumber: true,
          TotalManHours: true,
          startDate: true,
          endDate: true,
          sectors: true,
        },
        orderBy: [
          {
            updatedAt: "desc",
          },
          {
            name: "asc",
          },
        ],
      });

      // const result = [] as ManHourResult[];

      const resultsBySector = [] as {
        id: string;
        name: string;
        result: ManHourResult[];
      }[];

      for (const sector of sectors) {
        const result = [] as ManHourResult[];
        resultsBySector.push({
          id: sector.id,
          name: sector.name,
          result,
        });
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + input.monthCount);

      if (endDate.getMonth() > 11) {
        endDate.setFullYear(endDate.getFullYear() + 1);
        endDate.setMonth(endDate.getMonth() - 12);
      }

      const i = startDate;

      while (i <= endDate) {
        // console.log(i);

        const filteredProjects = projects.filter((x) => {
          if (x.startDate && x.endDate) {
            return (
              x.startDate.getFullYear() <= i.getFullYear() &&
              x.startDate.getMonth() <= i.getMonth() &&
              x.endDate.getFullYear() >= i.getFullYear() &&
              x.endDate.getMonth() >= i.getMonth()
            );
          }
          return false;
        });

        const foundSectors = [] as string[];

        for (const proj of filteredProjects) {
          const sector = sectors.find((x) => x.id === proj?.sectors[0]?.id);

          if (sector) {
            foundSectors.push(sector.id);
            const result = resultsBySector.find(
              (x) => x.id === sector.id
            )?.result;

            if (result) {
              const month = result.find(
                (x) => x.month === i.getMonth() && x.year === i.getFullYear()
              );

              const start = startDate.getTime();
              const end = endDate.getTime();

              const timeResult = end - start;

              let months = math.round(timeResult / (1000 * 60 * 60 * 24 * 30));

              if (months === 0) {
                months = 1;
              }

              const projManHours = proj.TotalManHours / months;

              if (month) {
                month.manHourCount += projManHours;
              } else {
                result.push({
                  month: i.getMonth(),
                  year: i.getFullYear(),
                  manHourCount: projManHours,
                });
              }
            }
          }
        }

        for (const sector of sectors) {
          if (!foundSectors.includes(sector.id)) {
            const result = resultsBySector.find(
              (x) => x.id === sector.id
            )?.result;

            if (result) {
              const month = result.find(
                (x) => x.month === i.getMonth() && x.year === i.getFullYear()
              );

              if (!month) {
                result.push({
                  month: i.getMonth(),
                  year: i.getFullYear(),
                  manHourCount: 0,
                });
              }
            }
          }
        }

        if (i.getMonth() === 11) {
          i.setFullYear(i.getFullYear() + 1);
          i.setMonth(0);
        } else {
          i.setMonth(i.getMonth() + 1);
        }
      }

      return resultsBySector;
    }),

  projectAverageRatings: privateProcedure.query(async ({ ctx }) => {
    const sectors = await ctx.prisma.sector.findMany({
      select: {
        id: true,
        name: true,
        Projects: {
          select: {
            profitabilityRating: true,
            customerRating: true,
            safetyRating: true,
            qualityRating: true,
            staffingRating: true,
          },
        },
      },
    });

    const result = [] as {
      sectorName: string;
      avgProfitabilityRating: number;
      avgCustomerRating: number;
      avgSafetyRating: number;
      avgQualityRating: number;
      avgStaffingRating: number;
    }[];

    for (const sector of sectors) {
      const sectorName = sector.name;

      const profitabilityRating = sector.Projects.reduce(
        (acc, curr) => acc + Number(curr.profitabilityRating),
        0
      );

      const customerRating = sector.Projects.reduce(
        (acc, curr) => acc + Number(curr.customerRating),
        0
      );

      const safetyRating = sector.Projects.reduce(
        (acc, curr) => acc + Number(curr.safetyRating),
        0
      );

      const qualityRating = sector.Projects.reduce(
        (acc, curr) => acc + Number(curr.qualityRating),
        0
      );

      const staffingRating = sector.Projects.reduce(
        (acc, curr) => acc + Number(curr.staffingRating),
        0
      );

      const avgProfitabilityRating =
        profitabilityRating / sector.Projects.length;
      const avgCustomerRating = customerRating / sector.Projects.length;
      const avgSafetyRating = safetyRating / sector.Projects.length;
      const avgQualityRating = qualityRating / sector.Projects.length;
      const avgStaffingRating = staffingRating / sector.Projects.length;

      result.push({
        sectorName,
        avgProfitabilityRating,
        avgCustomerRating,
        avgSafetyRating,
        avgQualityRating,
        avgStaffingRating,
      });
    }

    return result;
  }),
});

export type ManHourResult = {
  month: number;
  year: number;
  manHourCount: number;
};
