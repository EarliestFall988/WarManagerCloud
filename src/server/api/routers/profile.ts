import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";

import type { User } from "@clerk/nextjs/dist/api";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import filterUserForClient from "~/server/helpers/filerUserForClient";

export const profileRouter = createTRPCRouter({
  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        emailAddress: [input.email], //fixed this issue querying a single email address by using the email address array instead of the string param
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const result = filterUserForClient(user);

      return result;
    }),
});
