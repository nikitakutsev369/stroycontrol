import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { getSessionCookieOptions } from "../utils/cookie";
import { Errors } from "../errors";
import { db } from "../db";
import { sessions, foremen, admins } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const auth = new Hono();

// POST /api/auth/login
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const { name, password, pin, role } = body;

  if (role === "admin") {
    // Admin login
    const admin = await db.query.admins.findFirst({
      where: eq(admins.name, name),
    });

    if (!admin || admin.password !== password) {
      throw Errors.unauthorized("Неверное имя или пароль");
    }

    const sessionId = crypto.randomUUID();
    await db.insert(sessions).values({
      id: sessionId,
      userId: admin.id,
      role: "admin",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    setCookie(c, "kimi_sid", sessionId, {
      ...getSessionCookieOptions(c.req.raw.headers),
      maxAge: 365 * 24 * 60 * 60,
    });

    return c.json({
      user: { id: admin.id, name: admin.name, email: admin.email, role: "admin" },
      session: { sessionId, role: "admin" },
    });
  } else if (role === "foreman") {
    // Foreman login
    const foreman = await db.query.foremen.findFirst({
      where: eq(foremen.name, name),
    });

    if (!foreman || foreman.pin !== pin) {
      throw Errors.unauthorized("Неверное имя или PIN-код");
    }

    const sessionId = crypto.randomUUID();
    await db.insert(sessions).values({
      id: sessionId,
      foremanId: foreman.id,
      role: "foreman",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    setCookie(c, "kimi_sid", sessionId, {
      ...getSessionCookieOptions(c.req.raw.headers),
      maxAge: 365 * 24 * 60 * 60,
    });

    return c.json({
      foreman: { id: foreman.id, name: foreman.name, phone: foreman.phone, crewId: foreman.crewId },
      session: { sessionId, role: "foreman" },
    });
  }

  throw Errors.badRequest("Неверная роль");
});

// POST /api/auth/logout
auth.post("/logout", async (c) => {
  const sessionId = getCookie(c, "kimi_sid");
  
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  setCookie(c, "kimi_sid", "", { maxAge: 0 });
  
  return c.json({ success: true });
});

// GET /api/auth/me
auth.get("/me", async (c) => {
  const sessionId = getCookie(c, "kimi_sid");
  
  if (!sessionId) {
    throw Errors.unauthorized("Требуется авторизация");
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!session || new Date(session.expiresAt) < new Date()) {
    throw Errors.unauthorized("Сессия истекла");
  }

  if (session.role === "admin" && session.userId) {
    const user = await db.query.admins.findFirst({
      where: eq(admins.id, session.userId),
    });
    return c.json({ user: { id: user!.id, name: user!.name, email: user!.email, role: "admin" } });
  } else if (session.role === "foreman" && session.foremanId) {
    const foreman = await db.query.foremen.findFirst({
      where: eq(foremen.id, session.foremanId),
    });
    return c.json({ foreman: { id: foreman!.id, name: foreman!.name, phone: foreman!.phone, crewId: foreman!.crewId } });
  }

  throw Errors.unauthorized("Неверная сессия");
});

export { auth as authRoutes };
