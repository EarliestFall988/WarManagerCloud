import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import type { ExportLink } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs";
import CreateSchedule from "~/server/helpers/scheduleCreator";
import filterUserForClient from "~/server/helpers/filterUserForClient";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

const addUserToLinks = async (exportLinks: ExportLink[]) => {
  const users = await clerkClient.users
    .getUserList()
    .then((users) => {
      return users;
    })
    .catch((err) => {
      console.log(err);
    });

  if (!users)
    return exportLinks.map((link) => {
      return {
        ...link,
        user: null,
      };
    });

  const usersWithLinks = exportLinks.map((link) => {
    const user = users.find((user) => {
      return user.id === link.authorId;
    });

    if (!user) {
      return {
        ...link,
        user: null,
      };
    }

    return {
      ...link,
      user: filterUserForClient(user),
    };
  });

  return usersWithLinks;
};

export const schedulesRouter = createTRPCRouter({
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const schedule = await ctx.prisma.exportLink.findUnique({
        where: {
          id: input.id,
        },
      });

      return schedule;
    }),

  getByName: privateProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {

      const schedules = await ctx.prisma.exportLink.findMany({
        where: {
          OR: [
            {
              title: {
                contains: input.name,
              },
            },
            {
              description: {
                contains: input.name,
              },
            },
          ],
        },
        take: 100,
        orderBy: {
          createdAt: "desc",
        },
      });
      return addUserToLinks(schedules);
    }),

  create: privateProcedure
    .input(
      z.object({
        title: z.string().min(3).max(255),
        notes: z.string().optional(),
        nodes: z.string().min(1),
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

      const retrieveLink = await CreateSchedule(
        input.title,
        input.notes || "",
        input.nodes
      );

      const schedule = await ctx.prisma.exportLink.create({
        data: {
          title: input.title,
          link: retrieveLink,
          authorId,
          description: input.notes || "",
        },
      });

      return schedule;
    }),
});
