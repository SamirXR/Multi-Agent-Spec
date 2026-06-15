import { Request, Response } from 'express';
import { createTaskRecord, findAllTasks } from './db';

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const VALID_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const ALLOWED_CREATE_FIELDS = ['title', 'description', 'assigneeId', 'priority'];

export function createTask(req: Request, res: Response): void {
  const body = req.body;

  // Validate request body exists and is an object
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'Request body must be a JSON object', code: 400 });
    return;
  }

  // Check for unexpected fields
  const unexpectedFields = Object.keys(body).filter(k => !ALLOWED_CREATE_FIELDS.includes(k));
  if (unexpectedFields.length > 0) {
    res.status(400).json({ error: `Unexpected fields: ${unexpectedFields.join(', ')}`, code: 400 });
    return;
  }

  const { title, description, assigneeId, priority } = body;

  // Validate required fields are present
  if (title === undefined || description === undefined || assigneeId === undefined) {
    const missing: string[] = [];
    if (title === undefined) missing.push('title');
    if (description === undefined) missing.push('description');
    if (assigneeId === undefined) missing.push('assigneeId');
    res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}`, code: 400 });
    return;
  }

  // Validate types
  if (typeof title !== 'string') {
    res.status(400).json({ error: 'Field "title" must be a string', code: 400 });
    return;
  }

  if (typeof description !== 'string') {
    res.status(400).json({ error: 'Field "description" must be a string', code: 400 });
    return;
  }

  if (typeof assigneeId !== 'number' || !Number.isInteger(assigneeId)) {
    res.status(400).json({ error: 'Field "assigneeId" must be an integer', code: 400 });
    return;
  }

  // Validate priority if provided
  const effectivePriority = priority !== undefined ? priority : 'medium';
  if (typeof effectivePriority !== 'string') {
    res.status(400).json({ error: 'Field "priority" must be a string', code: 400 });
    return;
  }
  if (!VALID_PRIORITIES.includes(effectivePriority)) {
    res.status(400).json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`, code: 400 });
    return;
  }

  const task = createTaskRecord({ title, description, assigneeId, priority: effectivePriority });
  res.status(201).json(task);
}

export function listTasks(req: Request, res: Response): void {
  const statusParam = req.query.status as string | undefined;
  const assigneeIdParam = req.query.assigneeId as string | undefined;

  // Validate status enum if provided
  if (statusParam !== undefined && !VALID_STATUSES.includes(statusParam)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, code: 400 });
    return;
  }

  // Validate assigneeId is a valid integer if provided
  let assigneeId: number | undefined;
  if (assigneeIdParam !== undefined) {
    assigneeId = parseInt(assigneeIdParam, 10);
    if (isNaN(assigneeId)) {
      res.status(400).json({ error: 'Query parameter "assigneeId" must be an integer', code: 400 });
      return;
    }
  }

  res.json(findAllTasks({ status: statusParam, assigneeId }));
}
