import { Hono } from "hono";
import { db } from "../db";
import { crews } from "../db/schema";
import { eq } from "drizzle-orm";
import { Errors } from "../errors";

const routes = new Hono();

routes.get("/", async (c) => {
  const all = await db.query.crews.findMany();
  return c.json(all);
});

routes.post("/", async (c) => {
  const body = await c.req.json();
  const [newItem] = await db.insert(crews).values(body).returning();
  return c.json(newItem, 201);
});

routes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(crews).set(body).where(eq(crews.id, parseInt(id))).returning();
  if (!updated) throw Errors.notFound("Бригада не найдена");
  return c.json(updated);
});

routes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(crews).where(eq(crews.id, parseInt(id)));
  return c.json({ success: true });
});

export { routes as brigadesRoutes };
