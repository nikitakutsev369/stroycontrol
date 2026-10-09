import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, or, desc, asc, isNull } from "drizzle-orm";
import { createRouter, adminQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  projects,
  crews,
  foremen,
  stages,
  notifications,
} from "@db/schema";

// ---------- helpers ----------

async function requireForeman(foremanId: number, pin: string) {
  const db = getDb();
  const [f] = await db.select().from(foremen).where(eq(foremen.id, foremanId));
  if (!f || f.pin !== pin) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Неверный PIN-код" });
  }
  return f;
}

async function notify(input: {
  userId?: number | null;
  foremanId?: number | null;
  stageId?: number | null;
  type: string;
  title: string;
  message?: string;
}) {
  const db = getDb();
  // дедупликация: не создаём повторное уведомление того же типа по тому же этапу тому же получателю
  if (input.stageId && (input.type === "starts_soon" || input.type === "overdue" || input.type === "assigned")) {
    const existing = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.stageId, input.stageId),
          eq(notifications.type, input.type),
          input.foremanId
            ? eq(notifications.foremanId, input.foremanId)
            : eq(notifications.userId, input.userId ?? 0)
        )
      );
    if (existing.length > 0) return;
  }
  await db.insert(notifications).values({
    userId: input.userId ?? null,
    foremanId: input.foremanId ?? null,
    stageId: input.stageId ?? null,
    type: input.type,
    title: input.title,
    message: input.message ?? null,
  });
}

// Генерация уведомлений «скоро начало» и «просрочено»
async function syncScheduleNotifications(adminUserId: number) {
  const db = getDb();
  const all = await db.select().from(stages);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (const s of all) {
    if (s.status === "done") continue;
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    const [project] = await db.select().from(projects).where(eq(projects.id, s.projectId));
    const pName = project?.name ?? "объект";

    if (start <= tomorrow && start >= today && s.status === "planned") {
      if (s.foremanId) {
        await notify({
          foremanId: s.foremanId,
          stageId: s.id,
          type: "starts_soon",
          title: `Скоро начало этапа «${s.name}»`,
          message: `Объект: ${pName}. Начало: ${s.startDate}. Не забудьте перевести этап в работу.`,
        });
      }
      await notify({
        userId: adminUserId,
        stageId: s.id,
        type: "starts_soon",
        title: `Скоро начало: «${s.name}»`,
        message: `Объект: ${pName}. Начало: ${s.startDate}.`,
      });
    }
    if (end < today) {
      if (s.foremanId) {
        await notify({
          foremanId: s.foremanId,
          stageId: s.id,
          type: "overdue",
          title: `Просрочен этап «${s.name}»`,
          message: `Объект: ${pName}. Срок сдачи был ${s.endDate}.`,
        });
      }
      await notify({
        userId: adminUserId,
        stageId: s.id,
        type: "overdue",
        title: `Просрочен этап «${s.name}»`,
        message: `Объект: ${pName}. Срок сдачи был ${s.endDate}.`,
      });
    }
  }
}

// ---------- routers ----------

const projectRouter = createRouter({
  list: adminQuery.query(async () => {
    return getDb().select().from(projects).orderBy(asc(projects.name));
  }),
  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        customer: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await getDb().insert(projects).values(input);
      return { ok: true };
    }),
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        customer: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb().update(projects).set(data).where(eq(projects.id, id));
      return { ok: true };
    }),
  remove: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(stages).where(eq(stages.projectId, input.id));
    await db.delete(projects).where(eq(projects.id, input.id));
    return { ok: true };
  }),
});

const crewRouter = createRouter({
  list: adminQuery.query(async () => getDb().select().from(crews).orderBy(asc(crews.name))),
  create: adminQuery
    .input(z.object({ name: z.string().min(1), specialty: z.string().optional() }))
    .mutation(async ({ input }) => {
      await getDb().insert(crews).values(input);
      return { ok: true };
    }),
  update: adminQuery
    .input(z.object({ id: z.number(), name: z.string().min(1).optional(), specialty: z.string().optional() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb().update(crews).set(data).where(eq(crews.id, id));
      return { ok: true };
    }),
  remove: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await getDb().delete(crews).where(eq(crews.id, input.id));
    return { ok: true };
  }),
});

const foremanRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select({ foreman: foremen, crewName: crews.name })
      .from(foremen)
      .leftJoin(crews, eq(foremen.crewId, crews.id))
      .orderBy(asc(foremen.name));
    return rows.map((r) => ({ ...r.foreman, crewName: r.crewName }));
  }),
  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        pin: z.string().min(4).max(16),
        crewId: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await getDb().insert(foremen).values({ ...input, crewId: input.crewId ?? null });
      return { ok: true };
    }),
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        phone: z.string().optional(),
        pin: z.string().min(4).max(16).optional(),
        crewId: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb()
        .update(foremen)
        .set({ ...data, crewId: data.crewId === undefined ? undefined : data.crewId })
        .where(eq(foremen.id, id));
      return { ok: true };
    }),
  remove: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await getDb().delete(foremen).where(eq(foremen.id, input.id));
    return { ok: true };
  }),
});

const stageRouter = createRouter({
  // полная картина для Ганта (админ)
  listAll: adminQuery.query(async ({ ctx }) => {
    const db = getDb();
    await syncScheduleNotifications(ctx.user.id);
    const [allStages, allProjects, allCrews, allForemen] = await Promise.all([
      db.select().from(stages).orderBy(asc(stages.sortOrder), asc(stages.startDate)),
      db.select().from(projects).orderBy(asc(projects.name)),
      db.select().from(crews),
      db.select().from(foremen),
    ]);
    return { stages: allStages, projects: allProjects, crews: allCrews, foremen: allForemen };
  }),

  create: adminQuery
    .input(
      z.object({
        projectId: z.number(),
        crewId: z.number().nullable().optional(),
        foremanId: z.number().nullable().optional(),
        name: z.string().min(1),
        startDate: z.string(),
        endDate: z.string(),
        dependsOnId: z.number().nullable().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const res = await db.insert(stages).values({
        ...input,
        crewId: input.crewId ?? null,
        foremanId: input.foremanId ?? null,
        dependsOnId: input.dependsOnId ?? null,
      });
      const newId = Number(res[0].insertId);
      if (input.foremanId) {
        const [p] = await db.select().from(projects).where(eq(projects.id, input.projectId));
        await notify({
          foremanId: input.foremanId,
          stageId: newId,
          type: "assigned",
          title: `Назначен этап «${input.name}»`,
          message: `Объект: ${p?.name ?? ""}. Сроки: ${input.startDate} — ${input.endDate}.`,
        });
      }
      await syncScheduleNotifications(ctx.user.id);
      return { ok: true, id: newId };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        projectId: z.number().optional(),
        crewId: z.number().nullable().optional(),
        foremanId: z.number().nullable().optional(),
        name: z.string().min(1).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        dependsOnId: z.number().nullable().optional(),
        status: z.enum(["planned", "in_progress", "done"]).optional(),
        progress: z.number().min(0).max(100).optional(),
        comment: z.string().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...data } = input;
      const [prev] = await db.select().from(stages).where(eq(stages.id, id));
      const updateData: Record<string, unknown> = { ...data };
      if (data.status === "done") updateData.completedAt = new Date();
      if (data.status && data.status !== "done") updateData.completedAt = null;
      await db.update(stages).set(updateData).where(eq(stages.id, id));
      // уведомление прорабу при смене назначения
      if (data.foremanId && data.foremanId !== prev?.foremanId) {
        const [p] = await db.select().from(projects).where(eq(projects.id, prev.projectId));
        await notify({
          foremanId: data.foremanId,
          stageId: id,
          type: "assigned",
          title: `Вам назначен этап «${prev?.name ?? ""}»`,
          message: `Объект: ${p?.name ?? ""}.`,
        });
      }
      await syncScheduleNotifications(ctx.user.id);
      return { ok: true };
    }),

  remove: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await getDb().delete(stages).where(eq(stages.id, input.id));
    return { ok: true };
  }),
});

// Личный кабинет прораба (вход по ID + PIN, без аккаунта Kimi)
const foremanPortalRouter = createRouter({
  login: publicQuery
    .input(z.object({ foremanId: z.number(), pin: z.string() }))
    .mutation(async ({ input }) => {
      const f = await requireForeman(input.foremanId, input.pin);
      return { id: f.id, name: f.name, crewId: f.crewId };
    }),

  // список прорабов для выбора на экране входа (только id и имя)
  directory: publicQuery.query(async () => {
    const rows = await getDb()
      .select({ id: foremen.id, name: foremen.name })
      .from(foremen)
      .orderBy(asc(foremen.name));
    return rows;
  }),

  myStages: publicQuery
    .input(z.object({ foremanId: z.number(), pin: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      await requireForeman(input.foremanId, input.pin);
      const rows = await db
        .select({ stage: stages, project: projects, crew: crews })
        .from(stages)
        .innerJoin(projects, eq(stages.projectId, projects.id))
        .leftJoin(crews, eq(stages.crewId, crews.id))
        .where(eq(stages.foremanId, input.foremanId))
        .orderBy(asc(stages.startDate));
      return rows.map((r) => ({ ...r.stage, projectName: r.project.name, projectAddress: r.project.address, crewName: r.crew?.name ?? null }));
    }),

  updateStageStatus: publicQuery
    .input(
      z.object({
        foremanId: z.number(),
        pin: z.string(),
        stageId: z.number(),
        status: z.enum(["planned", "in_progress", "done"]),
        progress: z.number().min(0).max(100).optional(),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const f = await requireForeman(input.foremanId, input.pin);
      const [s] = await db.select().from(stages).where(eq(stages.id, input.stageId));
      if (!s || s.foremanId !== f.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Этап не назначен вам" });
      }
      const updateData: Record<string, unknown> = { status: input.status };
      if (input.progress !== undefined) updateData.progress = input.progress;
      if (input.comment !== undefined) updateData.comment = input.comment;
      if (input.status === "done") updateData.completedAt = new Date();
      else updateData.completedAt = null;
      await db.update(stages).set(updateData).where(eq(stages.id, input.stageId));
      // уведомить администратора
      const [p] = await db.select().from(projects).where(eq(projects.id, s.projectId));
      await notify({
        userId: null,
        stageId: s.id,
        type: input.status === "done" ? "completed" : "updated",
        title:
          input.status === "done"
            ? `Этап «${s.name}» выполнен`
            : `Обновление по этапу «${s.name}»`,
        message: `Прораб: ${f.name}. Объект: ${p?.name ?? ""}. Статус: ${
          input.status === "done" ? "выполнено" : input.status === "in_progress" ? "в работе" : "запланировано"
        }${input.comment ? `. Комментарий: ${input.comment}` : ""}`,
      });
      return { ok: true };
    }),

  myNotifications: publicQuery
    .input(z.object({ foremanId: z.number(), pin: z.string() }))
    .query(async ({ input }) => {
      await requireForeman(input.foremanId, input.pin);
      return getDb()
        .select()
        .from(notifications)
        .where(eq(notifications.foremanId, input.foremanId))
        .orderBy(desc(notifications.createdAt));
    }),

  markRead: publicQuery
    .input(z.object({ foremanId: z.number(), pin: z.string(), ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      await requireForeman(input.foremanId, input.pin);
      const db = getDb();
      for (const id of input.ids) {
        await db
          .update(notifications)
          .set({ read: true })
          .where(and(eq(notifications.id, id), eq(notifications.foremanId, input.foremanId)));
      }
      return { ok: true };
    }),
});

// Уведомления администратора
const notificationRouter = createRouter({
  list: adminQuery.query(async ({ ctx }) => {
    await syncScheduleNotifications(ctx.user.id);
    return getDb()
      .select()
      .from(notifications)
      .where(
        or(
          eq(notifications.userId, ctx.user.id),
          // уведомления, созданные прорабами (userId IS NULL, foremanId IS NULL)
          and(isNull(notifications.foremanId), isNull(notifications.userId))
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(100);
  }),
  // уведомления без конкретного получателя (от прорабов) — получаем отдельно
  listFromForemen: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(notifications)
      .where(and(isNull(notifications.userId), isNull(notifications.foremanId)))
      .orderBy(desc(notifications.createdAt))
      .limit(100);
  }),
  markRead: adminQuery
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const id of input.ids) {
        await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
      }
      return { ok: true };
    }),
});

export const constructionRouter = createRouter({
  project: projectRouter,
  crew: crewRouter,
  foreman: foremanRouter,
  stage: stageRouter,
  portal: foremanPortalRouter,
  notification: notificationRouter,
});
