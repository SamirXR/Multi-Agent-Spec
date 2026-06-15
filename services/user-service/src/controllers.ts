import { Request, Response } from 'express';
import { createUserRecord, findAllUsers, findUserById, emailExists } from './db';

export function createUser(req: Request, res: Response): void {
  const { name, email, phone, role = 'developer' } = req.body;

  if (!name || !email || !phone) {
    res.status(400).json({ error: 'Missing required fields: name, email, phone', code: 400 });
    return;
  }

  const validRoles = ['developer', 'designer', 'manager', 'tester'];
  if (role && !validRoles.includes(role)) {
    res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}`, code: 400 });
    return;
  }

  if (emailExists(email)) {
    res.status(400).json({ error: 'Email already exists', code: 400 });
    return;
  }

  const user = createUserRecord({ name, email, phone, role });
  res.status(201).json(user);
}

export function listUsers(req: Request, res: Response): void {
  const role = req.query.role as string | undefined;
  res.json(findAllUsers(role));
}

export function getUserById(req: Request, res: Response): void {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user ID', code: 400 });
    return;
  }

  const user = findUserById(id);
  if (!user) {
    res.status(404).json({ error: 'User not found', code: 404 });
    return;
  }

  res.json(user);
}
