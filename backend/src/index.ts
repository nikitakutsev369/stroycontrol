import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStaticFiles } from "./middleware/serve-static";
import { authRoutes } from "./routes/auth";
import { projectsRoutes } from "./routes/projects";
import { brigadesRoutes } from "./routes/brigades";
import { foremenRoutes } from "./routes/foremen";
import { stagesRoutes } from "./routes/stages";
import { notificationsRoutes } from "./routes/notifications";
import { env } from "./env";

const app = new Hono();

// API routes
app.route("/api/auth", authRoutes);
app.route("/api/projects", projectsRoutes);
app.route("/api/brigades", brigadesRoutes);
app.route("/api/foremen", foremenRoutes);
app.route("/api/stages", stagesRoutes);
app.route("/api/notifications", notificationsRoutes);

// Serve static files (frontend)
serveStaticFiles(app);

// Start server
const port = parseInt(process.env.PORT || "3000", 10);

console.log(`🚀 Server starting on port ${port}`);
console.log(`📦 Environment: ${env.isProduction ? "production" : "development"}`);
console.log(`🌐 API: http://localhost:${port}/api`);

serve({
  fetch: app.fetch,
  port,
});
