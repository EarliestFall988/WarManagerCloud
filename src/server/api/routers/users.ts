import { clerkClient } from "@clerk/nextjs";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { type User } from "@clerk/nextjs/server";
import type { User as PUser } from "@prisma/client";

// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";

import checkIfUserIsAdmin from "~/server/helpers/userIsAdmin";
import { z } from "zod";

type UserType = {
  User: User;
  metaData: PUser | undefined;
};

// const redis = new Redis({
//   url: "https://us1-merry-snake-32728.upstash.io",
//   token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
// });

// const rateLimit = new Ratelimit({
//   redis: redis,
//   limiter: Ratelimit.slidingWindow(3, "1 m"),
// });

const isValidUser = (user?: User) => {
  if (!user) {
    return false;
  }

  const email = user?.emailAddresses[0]?.emailAddress;

  if (!email) {
    return false;
  }

  return true;
};

export const usersRouter = createTRPCRouter({
  getAllUsers: privateProcedure.query(async ({ ctx }) => {
    const userMetaData = await ctx.prisma.user.findMany();

    const authorId = ctx.currentUser;

    await checkIfUserIsAdmin(authorId);

    const result = [] as UserType[];

    await clerkClient.users
      .getUserList()
      .then((users) => {
        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          const userMeta = userMetaData.find((meta) => {
            return meta.clerkId === user?.id;
          });

          if (!user) {
            continue;
          }

          if (!isValidUser(user)) {
            continue;
          }

          const data = {
            User: user,
            metaData: userMeta,
          };

          result.push(data);
        }

        return users;
      })
      .catch((err) => {
        console.log(err);
      });

    return result;
  }),

  searchForUsersMention: privateProcedure
    .input(
      z.object({
        searchTerm: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await clerkClient.users.getUserList();

      let searchTerm = input.searchTerm;

      if (searchTerm.startsWith("@")) {
        if (searchTerm.length > 1) {
          searchTerm = searchTerm.substring(1, searchTerm.length - 1);
        } else {
          searchTerm = "";
        }
      }

      const result = users
        .map((u) => {
          const addy = u.emailAddresses[0]?.emailAddress;

          if (addy !== undefined) {
            const mention = addy.split("@")[0]?.replace(".", "-");

            if (mention !== undefined) {
              if (searchTerm === undefined || searchTerm.length < 1)
                return mention;
              else if (mention.startsWith(searchTerm)) return mention;
            }
          }
          return null;
        })
        .filter((u) => u !== null);

      return result;
    }),
});
