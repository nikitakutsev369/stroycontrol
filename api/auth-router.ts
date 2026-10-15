import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery } from "./middleware";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    const cookieStr = `${Session.cookieName}=; Path=${opts.path}; Max-Age=0; HttpOnly${opts.secure ? "; Secure" : ""}; SameSite=${opts.sameSite}`;
    ctx.resHeaders.append("set-cookie", cookieStr);
    return { success: true };
  }),
});
