import { createTRPCRouter } from "~/server/api/trpc";
import { postsRouter } from "./routers/posts";
import { profileRouter } from "./routers/profile";
import { blueprintsRouter } from "./routers/blueprints";
import { crewMembersRouter } from "./routers/crewMembers";
import { projectsRouter } from "./routers/projects";
import { schedulesRouter } from "./routers/schedules";
import { sectorsRouter } from "./routers/sectors";
import { tagsRouter } from "./routers/tags";
import { developmentRouter } from "./routers/development";
import { notesRouter } from "./routers/notes";
import { logsRouter } from "./routers/logs";
import { usersRouter } from "./routers/users";
import { permissionsRouter } from "./routers/permissions";
import { permissionsKeyRouter } from "./routers/permissionsKey";
import { versioningRouter } from "./routers/versioning";
import { reactionsRouter } from "./routers/LogReactions";
import { logMessageReplies } from "./routers/logMessageReplies";
import { timeSchedulingRouter } from "./routers/timeScheduling";
import { messagesRouter } from "./routers/messages";
import attachedFilesRouter from "./routers/attachedFiles";

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
  development: developmentRouter,
  notes: notesRouter,
  logs: logsRouter,
  users: usersRouter,
  permissions: permissionsRouter,
  permissionsKeys: permissionsKeyRouter,
  versioning: versioningRouter,
  reactions: reactionsRouter,
  logReplies: logMessageReplies,
  timeScheduling: timeSchedulingRouter,
  messageHandling: messagesRouter,
  attachedFiles: attachedFilesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
