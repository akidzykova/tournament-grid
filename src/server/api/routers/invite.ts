import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ApiError } from "~/server/api/api-error";
import { ApiErrorCodeEnum } from "~/server/api/api-error-code.enum";

export const inviteRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        take: z.number().min(1).max(100),
        skip: z.number().min(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const organizationRequest = await ctx.db.matchInvite.findMany({
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
          match: {
            include: {
              organization: {
                select: {
                  name: true,
                },
              },
            },
          },
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
      const matchInvite = await ctx.db.matchInvite.findUnique({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          match: true,
        }
      });

      if (matchInvite == null) {
        throw new ApiError(ApiErrorCodeEnum.MATCH_INVITE_NOT_FOUND);
      }

      await ctx.db.matchInvite.delete({
        where: {
          id: input.id,
        },
      });

      await ctx.db.match.update({
        where: { id: matchInvite.match.id },
        data: {
          participants: {
            connect: [{ id: ctx.user.id }],
          },
        },
      });

      await ctx.db.notificaton.create({
        data: {
          title: `Приглашение в матч "${matchInvite.match.name}" принято`,
          text: `Теперь вы можете отслеживать матч в своей профиле`,
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
      const matchInvite = await ctx.db.matchInvite.findUnique({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          match: true,
        }
      });

      if (matchInvite == null) {
        throw new ApiError(ApiErrorCodeEnum.MATCH_INVITE_NOT_FOUND);
      }

      await ctx.db.matchInvite.delete({
        where: {
          id: input.id,
        },
      });

      await ctx.db.notificaton.create({
        data: {
          title: `Приглашение в матч "${matchInvite.match.name}" отклонено`,
          text: `Приглашение отклонено с вашей стороны`,
          userId: ctx.user.id,
        },
      });
    }),
});
