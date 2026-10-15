import { Hono } from "hono";
import { db } from "../db";
import { notifications } from "../db/schema";
import { eq } from "drizzle-orm";
import { Errors } from "../errors";

const routes = new Hono();

routes.get("/", async (c) => {
  const all = await db.query.notifications.findMany();
  return c.json(all);
});

routes.post("/:id/read", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, parseInt(id)))
    .returning();
  
  if (!updated) throw Errors.notFound("Уведомление не найдено");
  return c.json({ success: true });
});

routes.post("/read-all", async (c) => {
  await db.update(notifications).set({ read: true });
  return c.json({ success: true });
});

routes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(notifications).where(eq(notifications.id, parseInt(id)));
  return c.json({ success: true });
});

export { routes as notificationsRoutes };
