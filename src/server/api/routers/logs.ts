import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { Prisma, type Log } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs";
import filterUserForClient from "~/server/helpers/filterUserForClient";
import { use } from "react";

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

    Search: privateProcedure.input(z.object({
        search: z.string(),
        filter: z.array(z.string()),
    })).query(async ({ ctx, input }) => {

        console.log("filter", input.filter);

        if (input.search === "" && input.filter.length === 0) {
            const allLogs = await ctx.prisma.log.findMany({
                take: 100,
                orderBy: {
                    createdAt: "desc"
                }
            });

            return addUserToLogs(allLogs);
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
            if (user[i] !== undefined && split[1] !== undefined)
                user[i] = split[1];
        });


        const filters: Prisma.LogWhereInput = {};

        if (severity.length > 0) {
            filters.severity = {
                in: severity
            }
        }
        if (category.length > 0) {
            filters.category = {
                in: category
            }
        }
        if (user.length > 0) {
            filters.authorId = {
                in: user
            }
        }

        if (input.search.length > 0) {
            filters.OR = [
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
            ]
        }


        const allLogs = await ctx.prisma.log.findMany({
            where: filters,
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