import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { clerkClient } from "@clerk/nextjs";
import filterUserForClient from "~/server/helpers/filterUserForClient";
import { type Permissions } from "@prisma/client";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

const addUserToPermissions = async (permission: Permissions[]) => {
  const users = await clerkClient.users
    .getUserList()
    .then((users) => {
      return users;
    })
    .catch((err) => {
      console.log(err);
    });

  if (!users)
    return permission.map((permission) => {
      return {
        ...permission,
        user: null,
      };
    });

  const usersWithLinks = permission.map((permission) => {
    const user = users.find((user) => {
      return user.id === permission.authorId;
    });

    if (!user) {
      return {
        ...permission,
        user: null,
      };
    }

    return {
      ...permission,
      user: filterUserForClient(user),
    };
  });

  return usersWithLinks;
};

export const permissionsRouter = createTRPCRouter({
  getAllPermissions: privateProcedure.query(async ({ ctx }) => {
    const permissions = await ctx.prisma.permissions.findMany({
      include: {
        keywords: true,
      },
      take: 100,
      orderBy: {
        name: "asc",
      },
    });
    return permissions;
  }),

  getPermissionWithId: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const permission = await ctx.prisma.permissions.findUnique({
        include: {
          keywords: true,
        },
        where: {
          id: input.id,
        },
      });

      if (!permission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Permission not found",
        });
      }

      return addUserToPermissions([permission]);
    }),

  searchPermissions: privateProcedure
    .input(
      z.object({
        searchTerm: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const permissions = await ctx.prisma.permissions.findMany({
        include:
        {
          keywords: true,
        },
        where: {
          OR: [
            {
              name: {
                contains: input.searchTerm,
              },
            },
            {
              description: {
                contains: input.searchTerm,
              },
            },
          ],
        },
        take: 100,
      });

      return permissions;
    }),

  createPermission: privateProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(
            3,
            "The name of the permissions must be longer than 2 characters"
          )
          .max(
            50,
            "The name of the permissions must be shorter than 50 characters"
          ),
        description: z
          .string()
          .max(
            250,
            "The length of the description must be shorter than 250 characters"
          )
          .optional(),
        keywords: z.string().array().min(1, "you must have at least one keyword"),
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


      const permissions = await ctx.prisma.permissions.create({
        include: {
          keywords: true,
        },
        data: {
          name: input.name,
          description: input.description || "",
          authorId,
          keywords: {
            connect: input.keywords.map((keyword) => ({
              id: keyword,
            })),
          }
        },
      });

      return permissions;
    }),

  updatePermission: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        keywords: z.array(z.string()),
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

      const permissions = await ctx.prisma.permissions.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
          authorId,
        },
      });

      return permissions;
    }),

  deletePermissions: privateProcedure
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

      const permissions = await ctx.prisma.permissions.delete({
        where: {
          id: input.id,
        },
      });

      return permissions;
    }),
});
