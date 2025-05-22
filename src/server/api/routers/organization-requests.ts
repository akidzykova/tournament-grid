import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ApiError } from "~/server/api/api-error";
import { ApiErrorCodeEnum } from "~/server/api/api-error-code.enum";
import { MemberRole } from "@prisma/client";

export const organizationRequestsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        take: z.number().min(1).max(100),
        skip: z.number().min(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.user.roles.includes("admin");

      if (!isAdmin) {
        throw new ApiError(
          ApiErrorCodeEnum.NO_PERMISSIONS,
        );
      }

      const organizationRequest = await ctx.db.organizationRequest.findMany({
        take: input.take,
        skip: input.skip,
        orderBy: {
          requestedAt: "desc",
        },
        include: {
          user: true,
        },
      });

      return organizationRequest;
    }),
  accept: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.user.roles.includes("admin");

      if (!isAdmin) {
        throw new ApiError(
            ApiErrorCodeEnum.NO_PERMISSIONS,
        );
      }

      const organizationRequest = await ctx.db.organizationRequest.findUnique({
        where: {
          id: input.id,
        },
        include: {
          user: true,
        },
      });

      if (organizationRequest == null) {
        throw new ApiError(ApiErrorCodeEnum.ORGANIZATION_REQUEST_NOT_FOUND);
      }

      const organization = await ctx.db.organization.create({
        data: {
          name: organizationRequest.name,
          description: organizationRequest.description,
          founderId: organizationRequest.userId,
        },
      });

      await ctx.db.organizationRequest.delete({
        where: { id: input.id },
      });

      const organizationMember = await ctx.db.organizationMember.create({
        data: {
          userId: organizationRequest.userId,
          organizationId: organization.id,
          role: MemberRole.ADMIN,
        },
      });

      await ctx.db.notificaton.create({
        data: {
          title: `Организация ${organization.name} создана`,
          text: "Ваша заявка была рассмотрена. Теперь вам доступен функционал организации.",
          userId: organizationRequest.userId,
        },
      });
    }),
  reject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.user.roles.includes("admin");

      if (!isAdmin) {
        throw new ApiError(
            ApiErrorCodeEnum.NO_PERMISSIONS,
        );
      }

      const organizationRequest = await ctx.db.organizationRequest.findUnique({
        where: {
          id: input.id,
        },
        include: {
          user: true,
        },
      });

      if (organizationRequest == null) {
        throw new ApiError(ApiErrorCodeEnum.ORGANIZATION_REQUEST_NOT_FOUND);
      }

      await ctx.db.organizationRequest.delete({
        where: {
          id: input.id,
        },
      });

      await ctx.db.notificaton.create({
        data: {
          title: `Заявка на организацию отклонено`,
          text: `Администрация сайта отклонило вашу заявку`,
          userId: organizationRequest.user.id,
        },
      });
    }),
});
