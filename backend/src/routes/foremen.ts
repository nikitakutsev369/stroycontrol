import { Hono } from "hono";
import { db } from "../db";
import { foremen } from "../db/schema";
import { eq } from "drizzle-orm";
import { Errors } from "../errors";

const routes = new Hono();

routes.get("/", async (c) => {
  const all = await db.query.foremen.findMany();
  return c.json(all);
});

routes.post("/", async (c) => {
  const body = await c.req.json();
  const [newItem] = await db.insert(foremen).values(body).returning();
  return c.json(newItem, 201);
});

routes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(foremen).set(body).where(eq(foremen.id, parseInt(id))).returning();
  if (!updated) throw Errors.notFound("Прораб не найден");
  return c.json(updated);
});

routes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(foremen).where(eq(foremen.id, parseInt(id)));
  return c.json({ success: true });
});

export { routes as foremenRoutes };
