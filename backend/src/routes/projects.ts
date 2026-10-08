import { Hono } from "hono";
import { db } from "../db";
import { projects } from "../db/schema";
import { eq } from "drizzle-orm";
import { Errors } from "../errors";

const routes = new Hono();

// GET /api/projects
routes.get("/", async (c) => {
  const allProjects = await db.query.projects.findMany();
  return c.json(allProjects);
});

// GET /api/projects/:id
routes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, parseInt(id)),
  });

  if (!project) {
    throw Errors.notFound("Проект не найден");
  }

  return c.json(project);
});

// POST /api/projects
routes.post("/", async (c) => {
  const body = await c.req.json();
  const [newProject] = await db.insert(projects).values(body).returning();
  return c.json(newProject, 201);
});

// PATCH /api/projects/:id
routes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  
  const [updated] = await db
    .update(projects)
    .set(body)
    .where(eq(projects.id, parseInt(id)))
    .returning();

  if (!updated) {
    throw Errors.notFound("Проект не найден");
  }

  return c.json(updated);
});

// DELETE /api/projects/:id
routes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(projects).where(eq(projects.id, parseInt(id)));
  return c.json({ success: true });
});

export { routes as projectsRoutes };
