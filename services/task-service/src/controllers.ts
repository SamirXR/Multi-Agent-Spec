import { Request, Response } from 'express';
import { createTaskRecord, findAllTasks } from './db';

export function createTask(req: Request, res: Response): void {
  const { title, description, assigneeId, priority = 'medium' } = req.body;

  if (!title || !description || assigneeId === undefined) {
    res.status(400).json({ error: 'Missing required fields: title, description, assigneeId', code: 400 });
    return;
  }

  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (priority && !validPriorities.includes(priority)) {
    res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`, code: 400 });
    return;
  }

  const task = createTaskRecord({ title, description, assigneeId, priority });
  res.status(201).json(task);
}

export function listTasks(req: Request, res: Response): void {
  const status = req.query.status as string | undefined;
  const assigneeId = req.query.assigneeId ? parseInt(req.query.assigneeId as string, 10) : undefined;
  res.json(findAllTasks({ status, assigneeId }));
}
