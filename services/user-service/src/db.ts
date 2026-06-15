/**
 * In-memory data store for users.
 * Uses a simple array for zero-config, no native modules needed.
 */

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

let nextId = 1;
const users: UserRecord[] = [];

export function createUserRecord(data: { name: string; email: string; phone: string; role: string }): UserRecord {
  const user: UserRecord = {
    id: nextId++,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

export function findAllUsers(role?: string): UserRecord[] {
  if (role) return users.filter(u => u.role === role);
  return [...users];
}

export function findUserById(id: number): UserRecord | undefined {
  return users.find(u => u.id === id);
}

export function emailExists(email: string): boolean {
  return users.some(u => u.email === email);
}
