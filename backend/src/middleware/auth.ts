import type { Context, Next } from "hono";
import { authenticateRequest } from "../auth/auth";
import { Errors } from "../errors";

export async function authMiddleware(c: Context, next: Next) {
  try {
    const user = await authenticateRequest(c.req.raw.headers);
    c.set("user", user);
    await next();
  } catch (error) {
    if (error && typeof error === "object" && "tag" in error && error.tag === "app_error") {
      return c.json({ error: error.message }, error.status as any);
    }
    return c.json({ error: "Authentication failed" }, 401);
  }
}
