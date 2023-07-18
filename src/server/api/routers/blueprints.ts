import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs";
import { type Blueprint } from "@prisma/client";
import filterUserForClient from "~/server/helpers/filterUserForClient";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

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

  create: privateProcedure
    .input(
      z.object({
        name: z.string().min(3).max(255),
        description: z.string().min(0).max(255),
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
        }
      })

      return blueprint;
    }),

  save: privateProcedure
    .input(
      z.object({
        blueprintId: z.string(),
        flowInstanceData: z.string().min(0).max(100000),
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
        }
      })

      return blueprint;
    }),

  setBlueprintPined: privateProcedure.input(z.object({ blueprintId: z.string(), isPinned: z.boolean() })).mutation(async ({ ctx, input }) => {

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
        name: `${input.isPinned ? "Pinned" : "Unpinned"} \"${blueprint.name}\"`,
        authorId: authorId,
        url: `/blueprints/${blueprint.id}`,
        description: `${email} ${input.isPinned ? "Pinned" : "Unpinned"} "${blueprint.name}" from their War Manager Dashboard.`,
        severity: "info",
      }
    })

    return blueprint;
  }),

  updateDetails: privateProcedure
    .input(
      z.object({
        blueprintId: z.string(),
        name: z.string().min(3).max(255),
        description: z.string().min(0).max(255),
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

      const blueprint = await ctx.prisma.blueprint.update({
        where: {
          id: input.blueprintId,
        },
        data: {
          name: input.name,
          description: input.description,
        },
      });

      await ctx.prisma.log.create({
        data: {
          action: "url",
          category: "blueprint",
          name: `Updated \"${blueprint.name}\" Details`,
          authorId: authorId,
          url: `/blueprints/${blueprint.id}`,
          description: `Blueprint ${blueprint.name === name ? "" : ` name: from \"${name}\" to \"${blueprint.name}\" `} ${description === blueprint.description ? "" : ` description: from \"${description}\" to \"${blueprint.description}\"`}`,
          severity: "moderate",
        }
      })
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
        }
      })

      return blueprint;
    }),
});
