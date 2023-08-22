import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { SendMessageToDeveloper } from "~/server/helpers/sendEmailHelper";

export const messagesRouter = createTRPCRouter({
  sendMessage: privateProcedure
    .input(
      z.object({
        title: z.string().min(3).max(100),
        message: z.string().min(3).max(255),
      })
    )
    .mutation(async ({ input }) => {
      console.log("input", input);

      const message = await SendMessageToDeveloper(input.title, input.message);

      return {
        message,
      };
    }),
});
