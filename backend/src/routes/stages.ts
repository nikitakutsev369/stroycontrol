import { Hono } from "hono";
import { db } from "../db";
import { stages } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { Errors } from "../errors";

const routes = new Hono();

routes.get("/", async (c) => {
  const projectId = c.req.query("projectId");
  
  if (projectId) {
    const filtered = await db.query.stages.findMany({
      where: eq(stages.projectId, parseInt(projectId)),
    });
    return c.json(filtered);
  }

  const all = await db.query.stages.findMany();
  return c.json(all);
});

routes.post("/", async (c) => {
  const body = await c.req.json();
  const [newItem] = await db.insert(stages).values(body).returning();
  return c.json(newItem, 201);
});

routes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(stages).set(body).where(eq(stages.id, parseInt(id))).returning();
  if (!updated) throw Errors.notFound("Этап не найден");
  return c.json(updated);
});

routes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(stages).where(eq(stages.id, parseInt(id)));
  return c.json({ success: true });
});

export { routes as stagesRoutes };
