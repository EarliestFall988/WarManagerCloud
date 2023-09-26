import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import type { Prisma, Log, LogReaction, LogReply } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs";
import filterUserForClient from "~/server/helpers/filterUserForClient";
import { env } from "process";
import { HandleMentions } from "~/server/helpers/sendEmailHelper";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

type LogWithMetaData = Prisma.LogGetPayload<{
  include: {
    logReactions: true;
    _count: {
      select: {
        logReactions: true;
        logReplys: true;
      };
    };
  };
}>;

const addUserToLogs = async (logs: Log[]) => {
  const users = await clerkClient.users
    .getUserList()
    .then((users) => {
      return users;
    })
    .catch((err) => {
      console.log(err);
    });

  if (!users)
    return logs.map((log) => {
      return {
        ...log,
        user: null,
      };
    });

  const usersWithLinks = logs.map((log) => {
    const user = users.find((user) => {
      return user.id === log.authorId;
    });

    if (!user) {
      return {
        ...log,
        user: null,
      };
    }

    return {
      ...log,
      user: filterUserForClient(user),
    };
  });

  if (env.VERSION_TYPE !== "dev") {
    usersWithLinks.filter((log) => {
      if (log.user?.email !== "taylor.howell@jrcousa.com") {
        return true;
      }
      return false;
    });
  }

  return usersWithLinks;
};

const addUserToLogsWithMetaData = async (logs: LogWithMetaData[]) => {
  const users = await clerkClient.users
    .getUserList()
    .then((users) => {
      return users;
    })
    .catch((err) => {
      console.log(err);
    });

  if (!users)
    return logs.map((log) => {
      return {
        ...log,
        user: null,
      };
    });

  const usersWithLinks = logs.map((log) => {
    const user = users.find((user) => {
      return user.id === log.authorId;
    });

    if (!user) {
      return {
        ...log,
        user: null,
      };
    }

    return {
      ...log,
      user: filterUserForClient(user),
    };
  });

  if (env.VERSION_TYPE !== "dev") {
    usersWithLinks.filter((log) => {
      if (log.user?.email !== "taylor.howell@jrcousa.com") {
        return true;
      }
      return false;
    });
  }

  return usersWithLinks;
};

const addUserToReactions = async (reactions: LogReaction[]) => {
  const users = await clerkClient.users
    .getUserList()
    .then((users) => {
      return users;
    })
    .catch((err) => {
      console.log(err);
    });

  if (!users)
    return reactions.map((log) => {
      return {
        ...log,
        user: null,
      };
    });

  const usersWithReactions = reactions.map((log) => {
    const user = users.find((user) => {
      return user.id === log.authorId;
    });

    if (!user) {
      return {
        ...log,
        user: null,
      };
    }

    return {
      ...log,
      user: filterUserForClient(user),
    };
  });

  // if (env.VERSION_TYPE !== "dev") {
  //   usersWithLinks.filter((log) => {
  //     if (log.user?.email !== "taylor.howell@jrcousa.com") {
  //       return true;
  //     }
  //     return false;
  //   });
  // }

  return usersWithReactions;
};

const addUserToReplies = async (replies: LogReply[]) => {
  const users = await clerkClient.users
    .getUserList()
    .then((users) => {
      return users;
    })
    .catch((err) => {
      console.log(err);
    });

  if (!users)
    return replies.map((log) => {
      return {
        ...log,
        user: null,
      };
    });

  const usersWithReactions = replies.map((log) => {
    const user = users.find((user) => {
      return user.id === log.authorId;
    });

    if (!user) {
      return {
        ...log,
        user: null,
      };
    }

    return {
      ...log,
      user: filterUserForClient(user),
    };
  });

  // if (env.VERSION_TYPE !== "dev") {
  //   usersWithLinks.filter((log) => {
  //     if (log.user?.email !== "taylor.howell@jrcousa.com") {
  //       return true;
  //     }
  //     return false;
  //   });
  // }

  return usersWithReactions;
};

export const logsRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const allLogs = await ctx.prisma.log.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    return addUserToLogs(allLogs);
  }),

  getById: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const log = await ctx.prisma.log.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!log) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Log not found",
        });
      }

      const user = await clerkClient.users
        .getUser(log.authorId)
        .then((user) => {
          return user;
        })
        .catch((err) => {
          console.log(err);
        });

      if (!user) {
        return {
          ...log,
          user: null,
        };
      }

      return {
        ...log,
        user: filterUserForClient(user),
      };
    }),

  Search: privateProcedure
    .input(
      z.object({
        search: z.string(),
        filter: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log("filter", input.filter);

      if (input.search === "" && input.filter.length === 0) {
        const allLogs = await ctx.prisma.log.findMany({
          take: 100,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            _count: {
              select: {
                logReactions: true,
                logReplys: true,
              },
            },
            logReactions: true,
          },
        });

        return addUserToLogsWithMetaData(allLogs);
      }

      const severity = input.filter.filter((f) => {
        const split = f.split(":");
        if (split[0] === "severity") {
          return true;
        }

        return false;
      });

      const category = input.filter.filter((f) => {
        const split = f.split(":");
        if (split[0] === "category") {
          return true;
        }

        return false;
      });

      const user = input.filter.filter((f) => {
        const split = f.split(":");
        if (split[0] === "user") {
          return true;
        }

        return false;
      });

      severity.forEach((s, i) => {
        const split = s.split(":");
        if (severity[i] !== undefined && split[1] !== undefined)
          severity[i] = split[1];
      });

      category.forEach((s, i) => {
        const split = s.split(":");
        if (category[i] !== undefined && split[1] !== undefined)
          category[i] = split[1];
      });

      user.forEach((s, i) => {
        const split = s.split(":");
        if (user[i] !== undefined && split[1] !== undefined) user[i] = split[1];
      });

      const filters: Prisma.LogWhereInput = {};

      if (severity.length > 0) {
        filters.severity = {
          in: severity,
        };
      }
      if (category.length > 0) {
        filters.category = {
          in: category,
        };
      }
      if (user.length > 0) {
        filters.authorId = {
          in: user,
        };
      }

      if (input.search.length > 0) {
        filters.OR = [
          {
            id: {
              equals: input.search,
            },
          },
          {
            name: {
              contains: input.search,
            },
          },
          {
            description: {
              contains: input.search,
            },
          },
          {
            editedMessage: {
              contains: input.search,
            },
          },
          {
            category: {
              contains: input.search,
            },
          },
        ];
      }

      const allLogs = await ctx.prisma.log.findMany({
        where: filters,
        take: 100,
        include: {
          _count: {
            select: {
              logReactions: true,
              logReplys: true,
            },
          },
          logReactions: true,
          logReplys: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return addUserToLogsWithMetaData(allLogs);
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        url: z.string(),
        action: z.string(),
        category: z.string(),
        severity: z.string(),
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

      const newLog = await ctx.prisma.log.create({
        data: {
          name: input.name,
          description: input.description,
          url: input.url,
          action: input.action,
          category: input.category,
          authorId: authorId,
          severity: input.severity,
        },
      });

      if (input.category === "announcement") {
        await HandleMentions(input.description, newLog.id);
      }

      return addUserToLogs([newLog]);
    }),

  updateMessage: privateProcedure
    .input(
      z.object({
        id: z.string(),
        message: z.string(),
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

      const checkLog = await ctx.prisma.log.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!checkLog || checkLog?.category !== "announcement") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Log not found",
        });
      }

      const log = await ctx.prisma.log.update({
        where: {
          id: input.id,
        },
        data: {
          description: input.message,
          editedMessage: checkLog.description,
        },
      });

      console.log("updated log data", log);

      if (log.category === "announcement") {
        await HandleMentions(input.message, log.id);
      }

      return addUserToLogs([log]);
    }),

  getLogReactionsAndReplys: privateProcedure
    .input(
      z.object({
        logId: z.string(),
        removeMyReactions: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const log = await ctx.prisma.log.findUnique({
        where: {
          id: input.logId,
        },
        include: {
          logReactions: true,
          logReplys: true,
        },
      });

      if (!log) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Log not found",
        });
      }

      let totalReactions = log.logReactions;

      if (input.removeMyReactions) {
        totalReactions = log.logReactions.filter(
          (r) => r.authorId !== ctx.currentUser
        );
      }

      const reactions = await addUserToReactions(totalReactions);
      const replies = await addUserToReplies(log.logReplys);

      return {
        log,
        logReactions: reactions,
        logReplies: replies,
      };
    }),
});