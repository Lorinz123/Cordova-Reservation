import { findNotificationsForUser, markAllNotificationsRead } from "../repositories/notification.repository.js";

export function listUserNotifications(userId: string) {
  return findNotificationsForUser(userId);
}

export function markUserNotificationsRead(userId: string) {
  return markAllNotificationsRead(userId);
}
