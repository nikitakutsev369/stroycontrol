import {
  mysqlTable,
  mysqlEnum,
  serial,
  bigint,
  varchar,
  text,
  timestamp,
  date,
  boolean,
  int,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ===== СтройКонтроль =====

// Объекты строительства
export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }),
  customer: varchar("customer", { length: 255 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Project = typeof projects.$inferSelect;

// Бригады
export const crews = mysqlTable("crews", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Crew = typeof crews.$inferSelect;

// Прорабы (вход по имени + PIN-коду)
export const foremen = mysqlTable("foremen", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 64 }),
  pin: varchar("pin", { length: 16 }).notNull(),
  crewId: bigint("crewId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Foreman = typeof foremen.$inferSelect;

// Этапы работ
export const stages = mysqlTable("stages", {
  id: serial("id").primaryKey(),
  projectId: bigint("projectId", { mode: "number", unsigned: true }).notNull(),
  crewId: bigint("crewId", { mode: "number", unsigned: true }),
  foremanId: bigint("foremanId", { mode: "number", unsigned: true }),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: date("startDate", { mode: "string" }).notNull(),
  endDate: date("endDate", { mode: "string" }).notNull(),
  dependsOnId: bigint("dependsOnId", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["planned", "in_progress", "done"])
    .default("planned")
    .notNull(),
  progress: int("progress").default(0).notNull(), // 0..100
  comment: text("comment"),
  sortOrder: int("sortOrder").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
export type Stage = typeof stages.$inferSelect;

// Уведомления (для администратора и прорабов)
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  // кому: либо пользователю-админу, либо прорабу
  userId: bigint("userId", { mode: "number", unsigned: true }),
  foremanId: bigint("foremanId", { mode: "number", unsigned: true }),
  stageId: bigint("stageId", { mode: "number", unsigned: true }),
  type: varchar("type", { length: 64 }).notNull(), // assigned, starts_soon, overdue, completed, updated
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Notification = typeof notifications.$inferSelect;

// Сессии
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  foremanId: bigint("foremanId", { mode: "number", unsigned: true }),
  role: mysqlEnum("role", ["admin", "foreman"]).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Session = typeof sessions.$inferSelect;

// Админы (упрощённая версия)
export const admins = mysqlTable("admins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});
export type Admin = typeof admins.$inferSelect;
