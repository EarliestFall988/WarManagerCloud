import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import type { Log } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs";
import filterUserForClient from "~/server/helpers/filterUserForClient";

const redis = new Redis({
    url: "https://us1-merry-snake-32728.upstash.io",
    token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, "1 m"),
});

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

    return usersWithLinks;
};


export const logsRouter = createTRPCRouter({

    getAll: privateProcedure.query(async ({ ctx }) => {

        const allLogs = await ctx.prisma.log.findMany({
            take: 100,
            orderBy: {
                createdAt: "desc"
            }
        });

        return addUserToLogs(allLogs);
    }),

    create: privateProcedure.input(z.object({
        name: z.string(),
        description: z.string(),
        url: z.string(),
        action: z.string(),
        category: z.string(),
        severity: z.string(),
    })).mutation(async ({ ctx, input }) => {

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
            }
        });

        return addUserToLogs([newLog]);
    }),
});