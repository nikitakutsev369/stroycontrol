import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function findUserByUnionId(unionId: string) {
  return db.query.users.findFirst({
    where: eq(users.unionId, unionId),
  });
}

export async function upsertUser(data: {
  unionId: string;
  name?: string;
  avatar?: string;
  lastSignInAt?: Date;
}) {
  const existing = await findUserByUnionId(data.unionId);

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        name: data.name ?? existing.name,
        avatar: data.avatar ?? existing.avatar,
        lastSignInAt: data.lastSignInAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.unionId, data.unionId))
      .returning();
    return updated;
  }

  const [inserted] = await db
    .insert(users)
    .values({
      unionId: data.unionId,
      name: data.name,
      avatar: data.avatar,
      lastSignInAt: data.lastSignInAt ?? new Date(),
      role: "user",
    })
    .returning();
  return inserted;
}
