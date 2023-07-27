import { clerkClient } from "@clerk/nextjs";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { type User } from "@clerk/nextjs/server";
import type { User as PUser } from "@prisma/client";

// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";

import checkIfUserIsAdmin from "~/server/helpers/userIsAdmin";

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

  if (email) {
    //emails used for early connection testing and development, not included with the company and should not be included in the user list
    if (email === "greentractorland@gmail.com") {
      return false;
    }

    if (email === "howellkyle213@gmail.com") {
      return false;
    }

    if (email === "khelizabeths3@gmail.com") {
      return false;
    }

    if (email === "tnbnpmvx2r@privaterelay.appleid.com") {
      return false;
    }

    if (email === "howelltaylor195@gmail.com") {
      return false;
    }

    return true;
  }
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
});
