import { Router } from 'express';
import { createNotification, listNotifications } from './controllers';

const router = Router();

router.post('/notifications', createNotification);
router.get('/notifications', listNotifications);

export default router;
