import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs";

import { prisma } from "~/server/db";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

const attachedFilesRouter = createTRPCRouter({
  AddUploadedFile: privateProcedure
    .input(
      z.object({
        name: z.string(),
        uploadId: z.string(),
        url: z.string(),
        authorId: z.string(),
        size: z.number(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      if (!authorId) throw new TRPCError({ code: "UNAUTHORIZED" });

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

      const file = await prisma.attachedFiles.create({
        data: {
          authorId,
          name: input.name,
          uploadId: input.uploadId,
          url: input.url,
          size: input.size,
          Projects: {
            connect: {
              id: input.projectId,
            },
          },
        },
      });

      return file;
    }),
});

export default attachedFilesRouter;
