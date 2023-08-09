import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs";
import type {
  Project,
  Blueprint,
  CrewMember,
  ScheduleHistoryItem,
} from "@prisma/client";
import filterUserForClient from "~/server/helpers/filterUserForClient";
import { type Node } from "reactflow";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

type project = {
  id: string;
  crew: {
    id: string;
  }[];
};

type structure = {
  projects: project[];
  remainingNodes: remainingNode[];
};

const addUserToBlueprints = async (blueprints: Blueprint[]) => {
  const users = await clerkClient.users
    .getUserList()
    .then((users) => {
      return users;
    })
    .catch((err) => {
      console.log(err);
    });

  if (!users)
    return blueprints.map((blueprint) => {
      return {
        ...blueprint,
        user: null,
      };
    });

  const usersWithLinks = blueprints.map((blueprint) => {
    const user = users.find((user) => {
      return user.id === blueprint.authorId;
    });

    if (!user) {
      return {
        ...blueprint,
        user: null,
      };
    }

    return {
      ...blueprint,
      user: filterUserForClient(user),
    };
  });

  return usersWithLinks;
};

type remainingNode = {
  id: string;
};

type projectNode = {
  id: string;
  data: {
    id: string;
  };
};

type crewNode = {
  id: string;
  data: {
    id: string;
  };
};

export const GetListOfNodesSorted = (nodes: Node[]) => {
  const nodesSortedByColumn = nodes.sort((a, b) => {
    const xCol = a.position.x - b.position.x;

    if (xCol <= -15 || xCol >= 15) {
      return xCol;
    } else {
      return 0;
    }
  });

  //   console.log("sorted by column", nodesSortedByColumn);

  return nodesSortedByColumn;
};
const useCreateStructure = (n: Node[]) => {
  let s = {} as structure;
  const nodes = GetListOfNodesSorted(n);

  //   useEffect(() => {
  if (!nodes) return s;

  let currentProject = undefined as project | undefined;

  const structure = {
    projects: [] as project[],
    remainingNodes: [] as remainingNode[],
  };

  nodes.forEach((node) => {
    if (node.type === "projectNode") {
      const projectNode = node as projectNode;

      structure.projects.push({
        id: projectNode.data.id,
        crew: [],
      });

      currentProject = structure.projects[structure.projects.length - 1];
    } else if (node.type === "crewNode") {
      if (currentProject !== undefined) {
        const crewNode = node as crewNode;

        currentProject.crew.push({
          id: crewNode.data.id,
        });
      } else {
        structure.remainingNodes.push({
          id: node.id,
        });
      }
    }
  });

  s = structure;
  //   }, [nodes, projectData, crewData, isLoading]);

  return s;
};

type blueprintFlowType = {
  nodes: Node[];
};

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
        return addUserToBlueprints(blueprints);
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

      return addUserToBlueprints(blueprints);
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

  getOneByIdWithScheduleInfo: privateProcedure
    .input(z.object({ blueprintId: z.string() }))
    .query(async ({ ctx, input }) => {
      const blueprint = await ctx.prisma.blueprint.findUnique({
        where: {
          id: input.blueprintId,
        },
        include: {
          scheduleHistories: {
            include: {
              ScheduleHistoryItems: {
                include: {
                  crew: true,
                  project: true,
                  equipment: true,
                },
                orderBy: {
                  updatedAt: "desc",
                },
              },
            },
            orderBy: {
              updatedAt: "desc",
            },
          },
        },
      });
      return blueprint;
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z.string().min(3).max(255),
        description: z.string().min(0).max(255),
        liveData: z.boolean().default(false),
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

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const blueprint = await ctx.prisma.blueprint.create({
        data: {
          name: input.name,
          authorId,
          description: input.description,
          live: input.liveData,
          data: "{}",
        },
      });

      await ctx.prisma.log.create({
        data: {
          action: "url",
          category: "blueprint",
          name: "Created New Blueprint",
          authorId: authorId,
          url: `/blueprints/${blueprint.id}`,
          description: `Blueprint \"${blueprint.name}\" was created by ${email}`,
          severity: "moderate",
        },
      });

      return blueprint;
    }),

  save: privateProcedure
    .input(
      z.object({
        blueprintId: z.string(),
        flowInstanceData: z.string().min(0).max(100000),
        live: z.boolean().default(false),
        scheduling: z.boolean().default(false),
        startDate: z.date(),
        endDate: z.date(),
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

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const oldBlueprint = await ctx.prisma.blueprint.findFirst({
        where: {
          id: input.blueprintId,
        },
        include: {
          projects: true,
          crewMembers: true,
        },
      });

      const oldProjects = oldBlueprint?.projects || ([] as Project[]);
      const oldCrews = oldBlueprint?.crewMembers || ([] as CrewMember[]);

      if (input.live) {
        const res = JSON.parse(input.flowInstanceData) as blueprintFlowType;
        //checking if the blueprint is supposed to be live data...
        const structure = useCreateStructure(res.nodes);

        // console.log("structure", structure);

        // structure.projects.forEach((project) => {
        //   project.crew.forEach((crew) => {
        //     // console.log("crew", crew);
        //   });
        // });

        const crews = [] as { id: string }[];

        structure.projects.forEach((project) => {
          project.crew.forEach((crew) => {
            crews.push({
              id: crew.id,
            });
          });
        });

        const blueprint = await ctx.prisma.blueprint.update({
          where: {
            id: input.blueprintId,
          },
          data: {
            data: input.flowInstanceData,
            projects: {
              disconnect: oldProjects.map((project) => {
                return {
                  id: project.id,
                };
              }),
              connect: structure.projects.map((project) => {
                return {
                  id: project.id,
                };
              }),
            },
            crewMembers: {
              disconnect: oldCrews.map((crew) => {
                return {
                  id: crew.id,
                };
              }),
              connect: crews.map((crew) => {
                return {
                  id: crew.id,
                };
              }),
            },
          },
        });

        if (input.scheduling) {
          const scheduleHistoryItems = [] as ScheduleHistoryItem[];

          const scheduleHistory = await ctx.prisma.scheduleHistory.create({
            data: {
              authorId,
              notes: "",
              blueprintId: blueprint.id,
            },
          });

          structure.projects.map((project) => {
            project.crew.map(async (crew) => {
              const scheduleHistoryItem =
                await ctx.prisma.scheduleHistoryItem.create({
                  data: {
                    startTime: input.startDate.toDateString(),
                    endTime: input.endDate.toDateString(),
                    crewId: crew.id,
                    notes: "",
                    projectId: project.id,
                    authorId,
                    scheduleHistoryId: scheduleHistory.id,
                  },
                });
              scheduleHistoryItems.push(scheduleHistoryItem);
            });
          });

          await ctx.prisma.scheduleHistory.update({
            where: {
              id: scheduleHistory.id,
            },
            data: {
              ScheduleHistoryItems: {
                connect: scheduleHistoryItems.map((item) => {
                  return {
                    id: item.id,
                  };
                }),
              },
            },
          });
        }

        await ctx.prisma.log.create({
          data: {
            action: "url",
            category: "blueprint",
            name: `Edited \"${blueprint.name}\"`,
            authorId: authorId,
            url: `/blueprints/${blueprint.id}`,
            description: `${email} made some changes to \"${blueprint.name}\" `,
            severity: "moderate",
          },
        });

        return blueprint;
      } else {
        //ELSE STATEMENT HERE>>>>>>>>>>>>>
        const blueprint = await ctx.prisma.blueprint.update({
          where: {
            id: input.blueprintId,
          },
          data: {
            data: input.flowInstanceData,
          },
        });

        await ctx.prisma.log.create({
          data: {
            action: "url",
            category: "blueprint",
            name: `Edited \"${blueprint.name}\"`,
            authorId: authorId,
            url: `/blueprints/${blueprint.id}`,
            description: `${email} made some changes to \"${blueprint.name}\" `,
            severity: "moderate",
          },
        });

        return blueprint;
      }
    }),

  setBlueprintPined: privateProcedure
    .input(z.object({ blueprintId: z.string(), isPinned: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await ratelimit.limit(authorId);

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

      const blueprint = await ctx.prisma.blueprint.update({
        where: {
          id: input.blueprintId,
        },
        data: {
          pinned: input.isPinned,
        },
      });

      await ctx.prisma.log.create({
        data: {
          action: "url",
          category: "blueprint",
          name: `${input.isPinned ? "Pinned" : "Unpinned"} \"${
            blueprint.name
          }\"`,
          authorId: authorId,
          url: `/blueprints/${blueprint.id}`,
          description: `${email} ${input.isPinned ? "Pinned" : "Unpinned"} "${
            blueprint.name
          }" from their War Manager Dashboard.`,
          severity: "info",
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
        live: z.boolean().default(false),
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

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const beforeBlueprint = await ctx.prisma.blueprint.findUnique({
        where: {
          id: input.blueprintId,
        },
      });

      if (!beforeBlueprint) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blueprint not found",
        });
      }

      const name = beforeBlueprint.name;
      const description = beforeBlueprint.description;
      const live = beforeBlueprint.live || false;

      const blueprint = await ctx.prisma.blueprint.update({
        where: {
          id: input.blueprintId,
        },
        data: {
          name: input.name,
          description: input.description,
          live: input.live,
        },
      });

      await ctx.prisma.log.create({
        data: {
          action: "url",
          category: "blueprint",
          name: `Updated \"${blueprint.name}\" Details`,
          authorId: authorId,
          url: `/blueprints/${blueprint.id}`,
          description: `Blueprint ${
            blueprint.name === name
              ? ""
              : ` name: from \"${name}\" to \"${blueprint.name}\" `
          }${
            description === blueprint.description
              ? ""
              : ` description: from \"${description}\" to \"${blueprint.description}\"`
          }${
            live === blueprint.live
              ? ""
              : `${
                  blueprint.live
                    ? `${blueprint.name} is now live. War Manager will use it to check other schedules and blueprints conflicts and record schedule history.`
                    : "is now in zen mode. It will not be used to check for scheduling conflicts and record schedule history."
                }`
          }`,
          severity: "moderate",
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

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const blueprint = await ctx.prisma.blueprint.delete({
        where: {
          id: input.blueprintId,
        },
      });

      await ctx.prisma.log.create({
        data: {
          action: "url",
          category: "blueprint",
          name: `Deleted \"${blueprint.name}\"`,
          authorId: authorId,
          url: `/#`,
          description: `Blueprint \"${blueprint.name}\" was deleted by ${email}`,
          severity: "critical",
        },
      });

      return blueprint;
    }),
});
