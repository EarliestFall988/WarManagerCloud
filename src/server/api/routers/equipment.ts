import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export const EquipmentRouter = createTRPCRouter({
  createEquipment: privateProcedure
    .input(
      z.object({
        name: z.string().min(3, "An equipment item must have a name that is at least 3 characters long").max(255, "An equipment item must have a name that is less than 255 characters long"),
        identification: z.string().optional(),
        tags: z.array(z.string().min(3).max(255)),
        sectors: z
          .array(z.string())
          .min(1, "A member must be assigned a sector.")
          .max(1, "A member cannot be assigned more than one sector."),
        averageRunCostPerHour: z.number().min(0),
        notes: z.string().min(3).max(255),
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
    }),
});
