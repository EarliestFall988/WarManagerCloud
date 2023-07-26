import { env } from "process";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const versioningRouter = createTRPCRouter({
  getVersionType: publicProcedure.query(() => {
    return env.VERSION_TYPE == "PROD" ? "PROD" : "DEV";
  }),
  getVersionNumber: publicProcedure.query(() => {
    return env.VERSION_NUMBER;
  }),
});
