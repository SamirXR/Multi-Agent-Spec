import { Request, Response } from 'express';
import { createNotificationRecord, findAllNotifications } from './db';

const VALID_TYPES = ['info', 'success', 'warning', 'error'];
const ALLOWED_CREATE_FIELDS = ['userId', 'message', 'type'];

export function createNotification(req: Request, res: Response): void {
  const body = req.body;

  // Validate request body exists and is an object
  if (body === null || body === undefined || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'Request body must be a JSON object', code: 400 });
    return;
  }

  // Check for unexpected fields
  const unexpectedFields = Object.keys(body).filter(k => !ALLOWED_CREATE_FIELDS.includes(k));
  if (unexpectedFields.length > 0) {
    res.status(400).json({ error: `Unexpected fields: ${unexpectedFields.join(', ')}`, code: 400 });
    return;
  }

  const { userId, message, type } = body;

  // Validate required fields are present and not null
  const missing: string[] = [];
  if (userId === undefined || userId === null) missing.push('userId');
  if (message === undefined || message === null) missing.push('message');
  if (type === undefined || type === null) missing.push('type');
  if (missing.length > 0) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}`, code: 400 });
    return;
  }

  // Validate types
  if (typeof userId !== 'number' || !Number.isInteger(userId)) {
    res.status(400).json({ error: 'Field "userId" must be an integer', code: 400 });
    return;
  }

  if (typeof message !== 'string') {
    res.status(400).json({ error: 'Field "message" must be a string', code: 400 });
    return;
  }

  if (typeof type !== 'string') {
    res.status(400).json({ error: 'Field "type" must be a string', code: 400 });
    return;
  }

  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`, code: 400 });
    return;
  }

  const notification = createNotificationRecord({ userId, message, type });
  res.status(201).json(notification);
}

export function listNotifications(req: Request, res: Response): void {
  const userIdParam = req.query.userId as string | undefined;
  const readParam = req.query.read as string | undefined;

  // Validate userId is a valid integer if provided
  let userId: number | undefined;
  if (userIdParam !== undefined) {
    userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Query parameter "userId" must be an integer', code: 400 });
      return;
    }
  }

  // Validate read is a valid boolean if provided
  let read: boolean | undefined;
  if (readParam !== undefined) {
    if (readParam !== 'true' && readParam !== 'false') {
      res.status(400).json({ error: 'Query parameter "read" must be a boolean (true/false)', code: 400 });
      return;
    }
    read = readParam === 'true';
  }

  res.json(findAllNotifications({ userId, read }));
}
