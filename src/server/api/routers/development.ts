import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import Pusher from "pusher";
import { env } from "process";

// Pusher.logToConsole = env.NODE_ENV === "development";

const appId = env.NEXT_PUBLIC_PUSHER_APP_ID || "";
const appKey = env.NEXT_PUBLIC_PUSHER_KEY || "";
const appSecret = env.NEXT_PUBLIC_PUSHER_SECRET || "";
const appCluster = env.NEXT_PUBLIC_PUSHER_CLUSTER || "";

const pusher = new Pusher({
  appId: appId,
  key: appKey,
  secret: appSecret,
  cluster: appCluster,
  encrypted: true,
});

export const developmentRouter = createTRPCRouter({
  sendMessage: privateProcedure
    .input(
      z.object({
        message: z.string().min(1).max(100),
        channel: z.string().min(3).max(10),
        event: z.string().min(3).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //   console.log("testRouter: sendMessage: input: ", input);

      await pusher
        .trigger(input.channel, input.event, {
          message: input.message,
        })
        .catch((err) => {
          //   console.log("testRouter: sendMessage: err: ", err);
        });

      return input.message;
    }),
});
