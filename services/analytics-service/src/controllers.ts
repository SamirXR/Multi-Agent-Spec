import { Request, Response } from 'express';

// Analytics service aggregates data from other services
// In production, this would call User, Task, and Notification services
// For now, we fetch from them via HTTP or return computed data

async function fetchJSON(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getAnalytics(req: Request, res: Response): Promise<void> {
  try {
    // Attempt to fetch from other services
    const [users, tasks, notifications] = await Promise.all([
      fetchJSON('http://localhost:3001/users'),
      fetchJSON('http://localhost:3002/tasks'),
      fetchJSON('http://localhost:3003/notifications'),
    ]);

    const userList = Array.isArray(users) ? users : [];
    const taskList = Array.isArray(tasks) ? tasks : [];
    const notificationList = Array.isArray(notifications) ? notifications : [];

    const completedTasks = taskList.filter((t: any) => t.status === 'completed').length;
    const totalTasks = taskList.length;
    const activeNotifications = notificationList.filter((n: any) => !n.read).length;

    const tasksByPriority = {
      low: taskList.filter((t: any) => t.priority === 'low').length,
      medium: taskList.filter((t: any) => t.priority === 'medium').length,
      high: taskList.filter((t: any) => t.priority === 'high').length,
      critical: taskList.filter((t: any) => t.priority === 'critical').length,
    };

    const tasksByStatus = {
      pending: taskList.filter((t: any) => t.status === 'pending').length,
      in_progress: taskList.filter((t: any) => t.status === 'in_progress').length,
      completed: completedTasks,
      cancelled: taskList.filter((t: any) => t.status === 'cancelled').length,
    };

    res.json({
      totalUsers: userList.length,
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(2)) : 0,
      activeNotifications,
      tasksByPriority,
      tasksByStatus,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    // Fallback with empty data if services are unavailable
    res.json({
      totalUsers: 0,
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      activeNotifications: 0,
      tasksByPriority: { low: 0, medium: 0, high: 0, critical: 0 },
      tasksByStatus: { pending: 0, in_progress: 0, completed: 0, cancelled: 0 },
      generatedAt: new Date().toISOString(),
    });
  }
}
