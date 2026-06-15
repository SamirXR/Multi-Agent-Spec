import { Request, Response } from 'express';
import { createNotificationRecord, findAllNotifications } from './db';

export function createNotification(req: Request, res: Response): void {
  const { userId, message, type = 'info' } = req.body;

  if (userId === undefined || !message || !type) {
    res.status(400).json({ error: 'Missing required fields: userId, message, type', code: 400 });
    return;
  }

  const validTypes = ['info', 'success', 'warning', 'error'];
  if (!validTypes.includes(type)) {
    res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}`, code: 400 });
    return;
  }

  const notification = createNotificationRecord({ userId, message, type });
  res.status(201).json(notification);
}

export function listNotifications(req: Request, res: Response): void {
  const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
  const read = req.query.read !== undefined ? req.query.read === 'true' : undefined;
  res.json(findAllNotifications({ userId, read }));
}
