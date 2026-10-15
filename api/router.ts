import { authRouter } from "./auth-router";
import { constructionRouter } from "./construction-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  construction: constructionRouter,
});

export type AppRouter = typeof appRouter;
