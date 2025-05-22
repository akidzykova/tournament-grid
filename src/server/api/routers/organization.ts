import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { ApiErrorCodeEnum } from "~/server/api/api-error-code.enum";
import { ApiError } from "~/server/api/api-error";
import { MemberRole } from "@prisma/client";

export const organizationRouter = createTRPCRouter({
  createRequest: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(40),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existOrganizationRequest = await ctx.db.organizationRequest.count({
        where: {
          userId: ctx.user.id,
        },
        take: 1,
      });

      if (existOrganizationRequest > 0) {
        throw new ApiError(ApiErrorCodeEnum.ORGANIZATION_REQUEST_ALREADY_EXIST);
      }

      const organizationMember = await ctx.db.organizationMember.count({
        where: {
          userId: ctx.user.id,
        },
        take: 1,
      });

      if (organizationMember > 0) {
        throw new ApiError(ApiErrorCodeEnum.ORGANIZATION_ALREADY_EXIST);
      }

      try {
        const result = await ctx.db.organizationRequest.create({
          data: {
            name: input.name,
            description: input.description,
            userId: ctx.user.id,
          },
        });

        await ctx.db.notificaton.create({
          data: {
            title: "Заявка на создание организации",
            text: "Ваша заявка принята на рассмотрение. Она будет рассмотрена администрацией в течение 24 часов.",
            userId: ctx.user.id,
          },
        });

        return result;
      } catch {
        throw new ApiError(
          ApiErrorCodeEnum.ORGANIZATION_REQUEST_INTERNAL_ERROR,
        );
      }
    }),
  getRequest: protectedProcedure.query(async ({ ctx }) => {
    const organizationRequest = await ctx.db.organizationRequest.findFirst({
      where: {
        userId: ctx.user.id,
      },
    });

    return organizationRequest;
  }),
  getMember: protectedProcedure.query(async ({ ctx }) => {
    const organizationMember = await ctx.db.organizationMember.findFirst({
      where: {
        userId: ctx.user.id,
      },
    });

    console.log(`organizationMember: ${JSON.stringify(organizationMember)}`);

    return organizationMember;
  }),
  getMeOrganization: protectedProcedure.query(async ({ ctx }) => {
    const organizationMember = await ctx.db.organizationMember.findFirst({
      where: {
        userId: ctx.user.id,
      },
      select: {
        organizationId: true,
      },
    });

    if (organizationMember === null) {
      return null;
    }

    const organization = await ctx.db.organization.findUnique({
      where: { id: organizationMember.organizationId },
      include: {
        matches: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return organization;
  }),
  getMeOrganizationMember: protectedProcedure.query(async ({ ctx }) => {
    const organizationMember = await ctx.db.organizationMember.findFirst({
      where: {
        userId: ctx.user.id,
      },
    });

    if (organizationMember === null) {
      return null;
    }

    return organizationMember;
  }),
  getOrganizations: protectedProcedure
    .input(
      z.object({
        take: z.number().min(1).max(100),
        skip: z.number().min(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const organizations = await ctx.db.organization.findMany({
        take: input.take,
        skip: input.skip,
        include: {
          members: true,
        },
      });

      return organizations;
    }),
  getOrganization: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const organization = await ctx.db.organization.findUnique({
        where: { id: input.id },
        include: {
          founder: true,
          members: {
            include: {
              user: true,
            },
          },
          matches: true,
        },
      });

      return organization;
    }),
  sendOrganizationInvite: protectedProcedure
    .input(
      z.object({
        userLogin: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { login: input.userLogin },
      });

      if (user === null) {
        throw new ApiError(
          ApiErrorCodeEnum.USER_NOT_FOUND,
        );
      }

      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          userId: ctx.user.id,
        },
        select: {
          organizationId: true,
          role: true,
        },
      });

      if (organizationMember === null) {
        return null;
      }

      if (organizationMember.role === MemberRole.MEMBER) {
        throw new ApiError(ApiErrorCodeEnum.NO_PERMISSIONS);
      }

      await ctx.db.organizationInvite.create({
        data: {
          userId: user.id,
          organizationId: organizationMember.organizationId,
        },
      });
    }),
});
