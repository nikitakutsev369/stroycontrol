import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { getSessionCookieOptions } from "../utils/cookie";
import { Session } from "../constants";
import { Errors } from "../errors";
import { db } from "../db";
import { sessions, foremen, admins } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { createOAuthCallbackHandler, authenticateRequest } from "../auth/auth";
import { signSessionToken } from "../auth/session";
import { authMiddleware } from "../middleware/auth";

const auth = new Hono();

// GET /api/auth/oauth/start — начать OAuth flow
auth.get("/oauth/start", async (c) => {
  const redirectUri = c.req.query("redirect_uri") || `${c.req.url.split("/api")[0]}/api/auth/oauth/callback`;
  const state = btoa(redirectUri);
  
  const authUrl = new URL(`${process.env.KIMI_AUTH_URL}/api/oauth/authorize`);
  authUrl.searchParams.set("client_id", process.env.APP_ID || "");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "openid profile");
  
  return c.redirect(authUrl.toString(), 302);
});

// GET /api/auth/oauth/callback — OAuth callback
auth.get("/oauth/callback", createOAuthCallbackHandler());

// POST /api/auth/login — локальный вход (admin/foreman)
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const { name, password, pin, role } = body;

  if (role === "admin") {
    const admin = await db.query.admins.findFirst({
      where: eq(admins.name, name),
    });

    if (!admin || admin.password !== password) {
      throw Errors.unauthorized("Неверное имя или пароль");
    }

    const token = await signSessionToken({
      unionId: `admin_${admin.id}`,
      clientId: process.env.APP_ID || "local",
    });

    setCookie(c, Session.cookieName, token, {
      ...getSessionCookieOptions(c.req.raw.headers),
      maxAge: Session.maxAgeMs / 1000,
    });

    return c.json({
      user: { id: admin.id, name: admin.name, email: admin.email, role: "admin" },
    });
  } else if (role === "foreman") {
    const foreman = await db.query.foremen.findFirst({
      where: eq(foremen.name, name),
    });

    if (!foreman || foreman.pin !== pin) {
      throw Errors.unauthorized("Неверное имя или PIN-код");
    }

    const token = await signSessionToken({
      unionId: `foreman_${foreman.id}`,
      clientId: process.env.APP_ID || "local",
    });

    setCookie(c, Session.cookieName, token, {
      ...getSessionCookieOptions(c.req.raw.headers),
      maxAge: Session.maxAgeMs / 1000,
    });

    return c.json({
      foreman: { id: foreman.id, name: foreman.name, phone: foreman.phone, crewId: foreman.crewId },
    });
  }

  throw Errors.badRequest("Неверная роль");
});

// POST /api/auth/logout
auth.post("/logout", async (c) => {
  deleteCookie(c, Session.cookieName);
  return c.json({ success: true });
});

// GET /api/auth/me — текущий пользователь (требует авторизации)
auth.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export { auth as authRoutes };
