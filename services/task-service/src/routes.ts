import { Router } from 'express';
import { createTask, listTasks } from './controllers';

const router = Router();

router.post('/tasks', createTask);
router.get('/tasks', listTasks);

export default router;
