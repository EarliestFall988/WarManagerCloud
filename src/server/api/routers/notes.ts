import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: "https://us1-merry-snake-32728.upstash.io",
    token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

// Create a new ratelimit instance with 3 requests per minute
const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, "1 m"),
});


export const notesRouter = createTRPCRouter({


    getAll: privateProcedure.input(z.object({
        blueprintId: z.string().optional()
    })).query(async ({ ctx, input }) => {

        if (!input.blueprintId) {
            return await ctx.prisma.note.findMany();
        }

        return await ctx.prisma.note.findMany({
            where: {
                blueprintId: input.blueprintId
            }
        });
    }),

    getById: privateProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        const note = await ctx.prisma.note.findUnique({
            where: {
                id: input.id,
            },
        });

        if (!note) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Note not found",
            });
        }

        return note;

    }),

    upsert: privateProcedure.input(z.object({
        id: z.string().optional(),
        title: z.string(),
        text: z.string(),
        blueprintId: z.string()
    })).mutation(async ({ ctx, input }) => {

        const authorId = ctx.currentUser;

        const { success } = await ratelimit.limit(authorId);

        if (!success) {
            throw new TRPCError({
                code: "TOO_MANY_REQUESTS",
                message: "You have exceeded the rate limit, try again in a minute",
            });
        }

        if (input.id) {
            const note = await ctx.prisma.note.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.title,
                    description: input.text,
                    blueprintId: input.blueprintId
                }
            })

            return note;

        } else {

            const note = await ctx.prisma.note.create({
                data: {
                    name: input.title,
                    description: input.text,
                    blueprintId: input.blueprintId,
                    authorId: authorId,
                    data: "{}"
                }
            })

            return note;
        }
    }),
});