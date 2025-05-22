import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ApiError } from "~/server/api/api-error";
import { ApiErrorCodeEnum } from "~/server/api/api-error-code.enum";
import {MemberRole} from "@prisma/client";

export const organizationInviteRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        take: z.number().min(1).max(100),
        skip: z.number().min(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const organizationRequest = await ctx.db.organizationInvite.findMany({
        where: {
          userId: ctx.user.id,
        },
        take: input.take,
        skip: input.skip,
        orderBy: {
          createAt: "desc",
        },
        include: {
          user: true,
          organization: true,
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
      const matchInvite = await ctx.db.organizationInvite.findUnique({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          organization: true,
        }
      });

      if (matchInvite == null) {
        throw new ApiError(ApiErrorCodeEnum.ORGANIZATION_INVITE_NOT_FOUND);
      }

      await ctx.db.organizationInvite.delete({
        where: {
          id: input.id,
        },
      });

      await ctx.db.organizationMember.create({
        data: {
          userId: ctx.user.id,
          organizationId: matchInvite.organization.id,
          role: MemberRole.MODERATOR,
        },
      });

      await ctx.db.notificaton.create({
        data: {
          title: `Приглашение в организацию принято`,
          text: `Теперь вы состоите в организации "${matchInvite.organization.name}"`,
          userId: ctx.user.id,
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
      const matchInvite = await ctx.db.organizationInvite.findUnique({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          organization: true,
        }
      });

      if (matchInvite == null) {
        throw new ApiError(ApiErrorCodeEnum.ORGANIZATION_INVITE_NOT_FOUND);
      }

      await ctx.db.organizationInvite.delete({
        where: {
          id: input.id,
        },
      });

      await ctx.db.notificaton.create({
        data: {
          title: `Приглашение в матч "${matchInvite.organization.name}" отклонено`,
          text: `Приглашение отклонено с вашей стороны`,
          userId: ctx.user.id,
        },
      });
    }),
});
