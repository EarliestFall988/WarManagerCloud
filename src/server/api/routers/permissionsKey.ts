import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";


export const permissionsKeyRouter = createTRPCRouter({

    getAllKeys: privateProcedure.query(async ({ ctx }) => {
        const permissionsKeys = await ctx.prisma.permissionKey.findMany({
            take: 100,
            orderBy: {
                name: "asc",
            },
        });
        return permissionsKeys;
    }),

    getKeyWithId: privateProcedure.input(
        z.object({
            id: z.string(),
        })
    ).query(async ({ ctx, input }) => {
        const permissionKey = await ctx.prisma.permissionKey.findUnique({
            where: {
                id: input.id,
            },
        });

        return permissionKey;
    }),
});