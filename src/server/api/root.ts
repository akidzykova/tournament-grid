import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { matchRouter } from "./routers/match";
import {organizationRouter} from "~/server/api/routers/organization";
import {notificationRouter} from "~/server/api/routers/notification";
import {inviteRouter} from "~/server/api/routers/invite";
import {organizationInviteRouter} from "~/server/api/routers/organization-invite";
import {organizationRequestsRouter} from "~/server/api/routers/organization-requests";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  match: matchRouter,
  organization: organizationRouter,
  notification: notificationRouter,
  invite: inviteRouter,
  organizationInvite: organizationInviteRouter,
  organizationRequests: organizationRequestsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
