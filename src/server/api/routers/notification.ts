import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { ApiErrorCodeEnum } from "~/server/api/api-error-code.enum";
import { ApiError } from "~/server/api/api-error";

export const notificationRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const result = await ctx.db.notificaton.create({
                    data: {
                        title: input.name,
                        text: input.name,
                        userId: ctx.user.id,
                    },
                });

                return result;
            } catch {
                throw new ApiError(
                    ApiErrorCodeEnum.NOTIFICATION_CREATE_INTERNAL_ERROR,
                );
            }
        }),
    get: protectedProcedure
        .input(
            z.object({
                take: z.number().min(1).max(100),
                skip: z.number().min(0)
            })
        )
        .query(async ({ ctx, input }) => {
            const organizationRequest = await ctx.db.notificaton.findMany({
                where: {
                    userId: ctx.user.id,
                },
                take: input.take,
                skip: input.skip,
                orderBy: {
                    createAt: 'desc'
                }
            });

            return organizationRequest;
        }),
});
