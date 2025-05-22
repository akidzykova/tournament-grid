import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  userGetAllProcedure,
} from "~/server/api/trpc";

import bcrypt from "bcrypt";
import util from "util";
import jwt from "jsonwebtoken";
import { JWT_SECRET, type UserData } from "~/server/common/common";
import { ApiError } from "~/server/api/api-error";
import { ApiErrorCodeEnum } from "~/server/api/api-error-code.enum";

const bcryptHash = util.promisify(bcrypt.hash);
const SALT_ROUNDS = 10;

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        login: z.string(),
        email: z.string().email(),
        password: z.string().min(4),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.db.user.count();

      const existUser = await ctx.db.user.findFirst({
        where: {
          OR: [{ email: input.email }, { login: input.login }],
        },
      });

      if (existUser) {
        throw new ApiError(ApiErrorCodeEnum.USER_ALREADY_EXIST);
      }

      const hashedPassword = await bcryptHash(input.password, SALT_ROUNDS);

      try {
        const user = await ctx.db.user.create({
          data: {
            login: input.login,
            email: input.email,
            password: hashedPassword,
            roles: count < 1 ? ["user", "admin"] : ["user"],
          },
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        return {
          token: token,
        };
      } catch (e) {
        throw new ApiError(ApiErrorCodeEnum.USER_CREATE_INTERNAL_ERROR);
      }
    }),
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(4),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { email: input.email },
      });

      if (!user) {
        throw new Error("user not found");
      }

      const compared = await bcrypt.compare(input.password, user.password);

      if (!compared) {
        throw new Error("passwords not matched");
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      return {
        token: token,
      };
    }),
  get: protectedProcedure.query(async ({ ctx }): Promise<UserData> => {
    const userData: UserData = {
      email: ctx.user.email,
      login: ctx.user.login,
      roles: ctx.user.roles,
    };

    return userData;
  }),
  getAll: userGetAllProcedure.mutation(async ({ ctx }) => {
    return {
      users: ctx.users,
    };
  }),
});
