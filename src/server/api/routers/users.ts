import { clerkClient } from "@clerk/nextjs";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { type User } from "@clerk/nextjs/server";
import type { User as PUser } from "@prisma/client";

import { z } from "zod";

type UserType = {
  User: User;
  metaData: PUser | undefined;
};

export const usersRouter = createTRPCRouter({
  getAllUsers: privateProcedure.query(async ({ ctx }) => {
    const userMetaData = await ctx.prisma.user.findMany();

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

          const email = user?.emailAddresses[0]?.emailAddress;

          if (email) {
            //emails used for early connection testing and development, not included with the company and should not be included in the user list
            if (email === "greentractorland@gmail.com") {
              continue;
            }

            if (email === "howellkyle213@gmail.com") {
              continue;
            }

            if (email === "khelizabeths3@gmail.com") {
              continue;
            }

            if (email === "tnbnpmvx2r@privaterelay.appleid.com") {
              continue;
            }

            if (email === "howelltaylor195@gmail.com") {
              continue;
            }
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

//   createUser: privateProcedure
//     .input(
//       z.object({
//         clerkId: z.string(),
//         role: z.string(),
//       })
//     )
//     .mutation(async ({ ctx, input }) => {

//         const newUser = ctx.prisma.user.create({
//             data: {
//                 clerkId: input.clerkId,
//             }
//         })

//     }),
});
