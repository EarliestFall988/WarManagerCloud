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

        // const users = await clerkClient.users
        //     .getUserList()
        //     .then((users) => {
        //         return users;
        //     }).catch((err) => {
        //         console.log(err);
        //     });

        // if (!users)
        //     return [];

        // const userEmailandId = [] as { email: string, id: string }[];

        // users.forEach((user) => {

        //     const result = input.filter.find((email) => {
        //         if (user?.emailAddresses[0]?.emailAddress === email) {
        //             return true;
        //         }

        //         return false;
        //     });

        //     if (result && user?.emailAddresses[0]?.emailAddress) {
        //         userEmailandId.push({
        //             email: user?.emailAddresses[0]?.emailAddress,
        //             id: user.id
        //         });
        //     }
        // });

        // console.log("userEmailandId", userEmailandId);

        if (input.search.length > 0 && input.filter.length > 0) {
            const allLogs = await ctx.prisma.log.findMany({
                where: {
                    AND: [
                        {
                            OR: [

                                {
                                    severity: {
                                        in: input.filter,
                                    }
                                },
                                {
                                    category: {
                                        in: input.filter,
                                    }
                                },
                                {
                                    authorId: {
                                        in: input.filter,
                                    }
                                },
                            ],
                        },
                        {
                            OR: [
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
                                    url: {
                                        contains: input.search,
                                    },
                                },
                                {
                                    action: {
                                        contains: input.search,
                                    },
                                },
                                {
                                    category: {
                                        contains: input.search,
                                    },
                                },
                                {
                                    severity: {
                                        contains: input.search,
                                    },
                                },
                            ],
                        }
                    ],
                },
                take: 100,
                orderBy: {
                    createdAt: "desc"
                }
            });

            return addUserToLogs(allLogs);
        }
        if (input.search.length == 0 && input.filter.length > 0) {

            // console.log("fetching data", input.filter);

            const allLogs = await ctx.prisma.log.findMany({
                where: {
                    OR: [
                        {
                            severity: {
                                in: input.filter,
                            }
                        },
                        {
                            category: {
                                in: input.filter,
                            }
                        },
                        {
                            authorId: {
                                in: input.filter,
                            }
                        }
                    ],
                },
                take: 100,
                orderBy: {
                    createdAt: "desc"
                }
            });

            return addUserToLogs(allLogs);
        }

        if (input.search.length > 0 && input.filter.length == 0) {

            const allLogs = await ctx.prisma.log.findMany({
                where: {

                    OR: [
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
                            url: {
                                contains: input.search,
                            },
                        },
                        {
                            action: {
                                contains: input.search,
                            },
                        },
                        {
                            category: {
                                contains: input.search,
                            },
                        },
                        {
                            severity: {
                                contains: input.search,
                            },
                        },
                    ],
                },
                take: 100,
                orderBy: {
                    createdAt: "desc"
                }
            });

            return addUserToLogs(allLogs);
        }
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