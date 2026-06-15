export interface NotificationRecord {
  id: number;
  userId: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

let nextId = 1;
const notifications: NotificationRecord[] = [];

export function createNotificationRecord(data: { userId: number; message: string; type: string }): NotificationRecord {
  const notification: NotificationRecord = {
    id: nextId++,
    userId: data.userId,
    message: data.message,
    type: data.type,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(notification);
  return notification;
}

export function findAllNotifications(filters?: { userId?: number; read?: boolean }): NotificationRecord[] {
  let result = [...notifications];
  if (filters?.userId !== undefined) result = result.filter(n => n.userId === filters.userId);
  if (filters?.read !== undefined) result = result.filter(n => n.read === filters.read);
  return result;
}
