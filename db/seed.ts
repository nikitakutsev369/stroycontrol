import { getDb } from "../api/queries/connection";
import { projects, crews, foremen, stages } from "./schema";

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmt(d);
}

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  const existing = await db.select().from(projects);
  if (existing.length > 0) {
    console.log("Данные уже есть, пропускаю.");
    process.exit(0);
  }

  const p1 = await db.insert(projects).values({
    name: "ЖК «Северный», корпус 3",
    address: "ул. Строителей, 12",
    customer: "ООО «СеверСтрой»",
    description: "Монолитный жилой дом, 12 этажей",
  });
  const p1Id = Number(p1[0].insertId);
  const p2 = await db.insert(projects).values({
    name: "Торговый центр «Меридиан»",
    address: "пр. Победы, 45",
    customer: "АО «Меридиан-Инвест»",
    description: "Реконструкция фасада и внутренняя отделка",
  });
  const p2Id = Number(p2[0].insertId);

  const c1 = await db.insert(crews).values({ name: "Бригада №1", specialty: "Монолитные работы" });
  const c1Id = Number(c1[0].insertId);
  const c2 = await db.insert(crews).values({ name: "Бригада №2", specialty: "Кровля и фасад" });
  const c2Id = Number(c2[0].insertId);
  const c3 = await db.insert(crews).values({ name: "Бригада №3", specialty: "Отделочные работы" });
  const c3Id = Number(c3[0].insertId);

  const f1 = await db.insert(foremen).values({ name: "Иван Петров", phone: "+7 900 111-22-33", pin: "1234", crewId: c1Id });
  const f1Id = Number(f1[0].insertId);
  const f2 = await db.insert(foremen).values({ name: "Сергей Сидоров", phone: "+7 900 444-55-66", pin: "4321", crewId: c3Id });
  const f2Id = Number(f2[0].insertId);

  const s1 = await db.insert(stages).values({
    projectId: p1Id, crewId: c1Id, foremanId: f1Id,
    name: "Заливка фундамента",
    startDate: daysFromNow(-10), endDate: daysFromNow(-2),
    status: "done", progress: 100, completedAt: new Date(), sortOrder: 0,
  });
  const s1Id = Number(s1[0].insertId);

  const s2 = await db.insert(stages).values({
    projectId: p1Id, crewId: c1Id, foremanId: f1Id,
    name: "Возведение коробки (1–4 этаж)",
    startDate: daysFromNow(-1), endDate: daysFromNow(20),
    dependsOnId: s1Id, status: "in_progress", progress: 30, sortOrder: 1,
  });
  const s2Id = Number(s2[0].insertId);

  await db.insert(stages).values({
    projectId: p1Id, crewId: c2Id,
    name: "Монтаж кровли",
    startDate: daysFromNow(22), endDate: daysFromNow(35),
    dependsOnId: s2Id, status: "planned", sortOrder: 2,
  });

  await db.insert(stages).values({
    projectId: p2Id, crewId: c2Id,
    name: "Демонтаж старого фасада",
    startDate: daysFromNow(-5), endDate: daysFromNow(-1),
    status: "in_progress", progress: 80, sortOrder: 0,
  });

  await db.insert(stages).values({
    projectId: p2Id, crewId: c3Id, foremanId: f2Id,
    name: "Внутренняя отделка холла",
    startDate: daysFromNow(1), endDate: daysFromNow(14),
    status: "planned", sortOrder: 1,
  });

  console.log("Done.");
  process.exit(0);
}

seed();
