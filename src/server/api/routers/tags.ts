import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { type Tag } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs";
import filterUserForClient from "~/server/helpers/filterUserForClient";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

const addUserToTags = async (tags: Tag[]) => {
  const users = await clerkClient.users
    .getUserList()
    .then((users) => {
      return users;
    })
    .catch((err) => {
      console.log(err);
    });

  if (!users)
    return tags.map((tag) => {
      return {
        ...tag,
        user: null,
      };
    });

  const usersWithLinks = tags.map((tag) => {
    const user = users.find((user) => {
      return user.id === tag.authorId;
    });

    if (!user) {
      return {
        ...tag,
        user: null,
      };
    }

    return {
      ...tag,
      user: filterUserForClient(user),
    };
  });

  return usersWithLinks;
};

export const tagsRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const tags = await ctx.prisma.tag.findMany({
      take: 100,
    });
    return addUserToTags(tags);
  }),

  search: privateProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.name.length < 3) {
        const tags = await ctx.prisma.tag.findMany({
          take: 100,
        });
        return await addUserToTags(tags);
      }

      const tags = await ctx.prisma.tag.findMany({
        where: {
          name: {
            contains: input.name,
          },
        },
      });

      console.log("tags", tags);
      const res = await addUserToTags(tags);
      console.log("result", res);
      return res;
    }),

  getTagsToAdd: privateProcedure
    .input(z.object({ type: z.string() }))
    .query(async ({ ctx, input }) => {
      const newTags = await ctx.prisma.tag.findMany({
        where: {
          type: input.type,
        },
      });

      return newTags;
    }),

  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tag = await ctx.prisma.tag.findUnique({
        where: {
          id: input.id,
        },
      });

      return tag;
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, "Name must be more than 3 characters.")
          .max(20, "Name is too long! It must be less than 20 characters."),
        description: z
          .string()
          .min(0)
          .max(
            140,
            "The description is too long! It must be less than 140 characters"
          )
          .optional(),
        type: z
          .string()
          .min(3, "Be sure to select a category designation.")
          .max(20),
        color: z.string().min(3, "The color value is incorrect.").max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: " You have exceeded the rate limit.",
        });
      }

      const sameTag = await ctx.prisma.tag.findFirst({
        where: {
          name: input.name,
          type: input.type,
        },
      });

      if (sameTag) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A tag with this name already exists.",
        });
      }

      const tag = await ctx.prisma.tag.create({
        data: {
          authorId,
          name: input.name,
          description: input.description || "",
          type: input.type,
          backgroundColor: input.color,
        },
      });

      return tag;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z
          .string()
          .min(3, "Name must be more than 3 characters.")
          .max(20, "Name is too long! It must be less than 20 characters."),
        description: z
          .string()
          .min(0)
          .max(
            140,
            "The description is too long! It must be less than 140 characters"
          )
          .optional(),
        type: z
          .string()
          .min(3, "Be sure to select a category designation.")
          .max(20),
        color: z.string().min(3, "The color value is incorrect.").max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: " You have exceeded the rate limit.",
        });
      }

      const tag = await ctx.prisma.tag.update({
        where: {
          id: input.id,
        },
        data: {
          authorId,
          name: input.name,
          description: input.description || "",
          type: input.type,
          backgroundColor: input.color,
        },
      });

      return tag;
    }),
  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: " You have exceeded the rate limit.",
        });
      }

      const tag = await ctx.prisma.tag.findFirst({
        where: {
          id: input.id,
        },
      });

      if (tag?.systemTag) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot delete a system tag.",
        });
      }

      const result = ctx.prisma.tag.delete({
        where: {
          id: input.id,
        },
      });

      return result;
    }),
});
