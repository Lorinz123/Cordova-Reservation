import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications } from "../schema/index.js";

export async function findNotificationsForUser(userId: string) {
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markAllNotificationsRead(userId: string) {
  await db.update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}
