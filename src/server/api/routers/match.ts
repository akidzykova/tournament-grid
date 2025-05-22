import { z } from "zod";

import {
  createTRPCRouter,
  matchProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { ApiError } from "~/server/api/api-error";
import { ApiErrorCodeEnum } from "~/server/api/api-error-code.enum";
import {MatchStatus, MemberRole} from "@prisma/client";
import {type Bracket, generateBracket} from "~/utils/generate-bracket";

export const matchRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        gender: z.string().min(3),
        category: z.string().min(3),
        date: z.string().date(),
        participantsCount: z.number().min(2),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const match = await ctx.db.match.findFirst({
        where: {
          name: input.name,
        },
      });

      if (match) {
        throw new Error("match already exist");
      }

      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          userId: ctx.user.id,
        },
        select: {
          organizationId: true,
        },
      });

      if (organizationMember === null) {
        throw new ApiError(ApiErrorCodeEnum.USER_NOT_A_MEMBER_OF_ORGANIZATION);
      }

      const organization = await ctx.db.organization.findUnique({
        where: { id: organizationMember.organizationId },
      });

      if (organization === null) {
        throw new ApiError(ApiErrorCodeEnum.ORGANIZATION_NOT_FOUND);
      }

      const bracket = generateBracket(input.participantsCount);

      await ctx.db.match.create({
        data: {
          name: input.name,
          organizationId: organization.id,

          date: input.date,

          gender: input.gender,
          category: input.category,

          participantsCount: input.participantsCount,

          structure: JSON.stringify(bracket),
        },
      });
    }),
  set: publicProcedure
    .input(
      z.object({
        id: z.string(),
        structure: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.match.update({
        where: {
          id: input.id,
        },
        data: {
          structure: input.structure,
        },
      });
    }),
  get: matchProcedure.mutation(async ({ ctx }) => {
    return {
      matches: ctx.match,
    };
  }),
  getMatch: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const match = await ctx.db.match.findUnique({
        where: { id: input.id },
        include: {
          participants: true,
          organization: true,
          invites: {
            include: {
              user: true,
            },
          },
        },
      });

      return match;
    }),
  invite: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        login: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
        throw new ApiError(ApiErrorCodeEnum.USER_NOT_A_MEMBER_OF_ORGANIZATION);
      }

      if (organizationMember.role === MemberRole.MEMBER) {
        throw new ApiError(ApiErrorCodeEnum.NO_PERMISSIONS);
      }

      const match = await ctx.db.match.findUnique({
        where: { id: input.matchId },
        include: {
          participants: true,
          organization: true,
          invites: true,
        },
      });

      if (match == null) {
        throw new ApiError(ApiErrorCodeEnum.MATCH_NOT_FOUND);
      }

      if (match.organizationId !== organizationMember.organizationId) {
        throw new ApiError(ApiErrorCodeEnum.NO_PERMISSIONS);
      }

      if (match.participants.length >= match.participantsCount) {
        throw new ApiError(ApiErrorCodeEnum.PARTICIPANTS_LIMIT);
      }

      if (
        match.invites.length >=
        match.participantsCount - match.participants.length
      ) {
        throw new ApiError(ApiErrorCodeEnum.PARTICIPANTS_LIMIT);
      }

      const user = await ctx.db.user.findFirst({
        where: {
          login: input.login,
        },
      });

      if (user == null) {
        throw new ApiError(ApiErrorCodeEnum.USER_NOT_FOUND);
      }


      const isParticipant =
        match.participants.findIndex(
          (participant) => participant.id === user.id,
        ) > -1;

      if (isParticipant) {
        throw new ApiError(ApiErrorCodeEnum.ALREADY_PARTICIPANT);
      }

      const existMatchInvite = await ctx.db.matchInvite.findFirst({
        where: {
          userId: user.id,
          matchId: match.id,
        },
      });

      if (existMatchInvite !== null) {
        throw new ApiError(ApiErrorCodeEnum.INVITE_ALREADY_EXIST);
      }

      await ctx.db.matchInvite.create({
        data: {
          userId: user.id,
          matchId: match.id,
        },
      });

      await ctx.db.notificaton.create({
        data: {
          title: `Приглашение в матч "${match.name}"`,
          text: `Ваc пригласили принять участие в матче "${match.name}", перейдите во вкладку приглашений для того, чтобы принять его`,
          userId: ctx.user.id,
        },
      });
    }),
  singleEliminationBracketMutation: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        structure: z.array(z.any()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          userId: ctx.user.id,
        },
        select: {
          organizationId: true,
          role: true,
        },
      });

      if (organizationMember == null) {
        throw new ApiError(ApiErrorCodeEnum.USER_NOT_A_MEMBER_OF_ORGANIZATION);
      }

      if (organizationMember.role === MemberRole.MEMBER) {
        throw new ApiError(ApiErrorCodeEnum.NO_PERMISSIONS);
      }

      const match = await ctx.db.match.findUnique({
        where: {
          id: input.id,
          organizationId: organizationMember.organizationId,
        }
      });

      if (match == null) {
        throw new ApiError(ApiErrorCodeEnum.MATCH_NOT_FOUND);
      }

      if (match.status !== MatchStatus.STARTED) {
        throw new ApiError(ApiErrorCodeEnum.NO_PERMISSIONS);
      }

      await ctx.db.match.update({
        where: {
          id: input.id,
        },
        data: {
          structure: JSON.stringify(input.structure),
        }
      })
    }),
  nextStatus: protectedProcedure
      .input(
          z.object({
            id: z.string(),
          }),
      )
      .mutation(async ({ ctx, input }) => {
        const organizationMember = await ctx.db.organizationMember.findFirst({
          where: {
            userId: ctx.user.id,
          },
          select: {
            organizationId: true,
            role: true,
          },
        });

        if (organizationMember == null) {
          throw new ApiError(ApiErrorCodeEnum.USER_NOT_A_MEMBER_OF_ORGANIZATION);
        }

        if (organizationMember.role === MemberRole.MEMBER) {
          throw new ApiError(ApiErrorCodeEnum.NO_PERMISSIONS);
        }

        const match = await ctx.db.match.findUnique({
          where: {
            id: input.id,
            organizationId: organizationMember.organizationId,
          },
          include: {
            participants: true,
          }
        });

        if (match == null) {
          throw new ApiError(ApiErrorCodeEnum.MATCH_NOT_FOUND);
        }

        switch (match.status) {
          case MatchStatus.SCHEDULED: {
            if (match.participants.length < match.participantsCount) {
              throw new ApiError(ApiErrorCodeEnum.NO_PERMISSIONS);
            }

            const structureData = JSON.parse(match.structure) as Bracket[]

            let lastStructureDataIndex = 0;

            for (const [index, participant] of match.participants.entries()) {
              const isPlayerOne = index % 2 === 0;
              const data = structureData[lastStructureDataIndex]!;

              if (isPlayerOne) {
                data.player1 = {
                  id: participant.id,
                  name: participant.login,
                }
              }
              else {
                data.player2 = {
                  id: participant.id,
                  name: participant.login,
                }

                lastStructureDataIndex++;
              }
            }

            await ctx.db.match.update({
              where: {
                id: input.id,
              },
              data: {
                status: MatchStatus.STARTED,
                structure: JSON.stringify(structureData),
              }
            })

            break;
          }
          case MatchStatus.STARTED: {
            await ctx.db.match.update({
              where: {
                id: input.id,
              },
              data: {
                status: MatchStatus.ENDED,
              }
            })

            break;
          }
        }
      }),
});
