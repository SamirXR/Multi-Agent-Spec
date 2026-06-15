import { Request, Response } from 'express';
import { createUserRecord, findAllUsers, findUserById, emailExists } from './db';

const VALID_ROLES = ['developer', 'designer', 'manager', 'tester'];
const ALLOWED_CREATE_FIELDS = ['name', 'email', 'phone', 'role'];

export function createUser(req: Request, res: Response): void {
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

  const { name, email, phone, role } = body;

  // Validate required fields are present
  if (name === undefined || email === undefined || phone === undefined) {
    const missing: string[] = [];
    if (name === undefined) missing.push('name');
    if (email === undefined) missing.push('email');
    if (phone === undefined) missing.push('phone');
    res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}`, code: 400 });
    return;
  }

  // Validate types
  if (typeof name !== 'string') {
    res.status(400).json({ error: 'Field "name" must be a string', code: 400 });
    return;
  }

  if (typeof email !== 'string') {
    res.status(400).json({ error: 'Field "email" must be a string', code: 400 });
    return;
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Field "email" must be a valid email address', code: 400 });
    return;
  }

  if (typeof phone !== 'string') {
    res.status(400).json({ error: 'Field "phone" must be a string', code: 400 });
    return;
  }

  // Validate role if provided
  const effectiveRole = role !== undefined ? role : 'developer';
  if (typeof effectiveRole !== 'string') {
    res.status(400).json({ error: 'Field "role" must be a string', code: 400 });
    return;
  }
  if (!VALID_ROLES.includes(effectiveRole)) {
    res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, code: 400 });
    return;
  }

  if (emailExists(email)) {
    res.status(400).json({ error: 'Email already exists', code: 400 });
    return;
  }

  const user = createUserRecord({ name, email, phone, role: effectiveRole });
  res.status(201).json(user);
}

export function listUsers(req: Request, res: Response): void {
  const role = req.query.role as string | undefined;

  // Validate role enum if provided
  if (role !== undefined && !VALID_ROLES.includes(role)) {
    res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, code: 400 });
    return;
  }

  res.json(findAllUsers(role));
}

export function getUserById(req: Request, res: Response): void {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user ID: must be an integer', code: 400 });
    return;
  }

  const user = findUserById(id);
  if (!user) {
    res.status(404).json({ error: 'User not found', code: 404 });
    return;
  }

  res.json(user);
}
