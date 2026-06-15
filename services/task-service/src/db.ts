export interface TaskRecord {
  id: number;
  title: string;
  description: string;
  assigneeId: number;
  status: string;
  priority: string;
  createdAt: string;
}

let nextId = 1;
const tasks: TaskRecord[] = [];

export function createTaskRecord(data: { title: string; description: string; assigneeId: number; priority: string }): TaskRecord {
  const task: TaskRecord = {
    id: nextId++,
    title: data.title,
    description: data.description,
    assigneeId: data.assigneeId,
    status: 'pending',
    priority: data.priority,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

export function findAllTasks(filters?: { status?: string; assigneeId?: number }): TaskRecord[] {
  let result = [...tasks];
  if (filters?.status) result = result.filter(t => t.status === filters.status);
  if (filters?.assigneeId) result = result.filter(t => t.assigneeId === filters.assigneeId);
  return result;
}
