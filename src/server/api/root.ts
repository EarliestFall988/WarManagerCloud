import { createTRPCRouter } from "~/server/api/trpc";
import { postsRouter } from "./routers/posts";
import { profileRouter } from "./routers/profile";
import { blueprintsRouter } from "./routers/blueprints";
import { crewMembersRouter } from "./routers/crewMembers";
import { projectsRouter } from "./routers/projects";
import { schedulesRouter } from "./routers/schedules";
import { sectorsRouter } from "./routers/sectors";
import { tagsRouter } from "./routers/tags";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  posts: postsRouter,
  profile: profileRouter,
  blueprints: blueprintsRouter,
  crewMembers: crewMembersRouter,
  projects: projectsRouter,
  schedules: schedulesRouter,
  sectors: sectorsRouter,
  tags: tagsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
