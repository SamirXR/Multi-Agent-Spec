import { Router } from 'express';
import { createUser, listUsers, getUserById } from './controllers';

const router = Router();

router.post('/users', createUser);
router.get('/users', listUsers);
router.get('/users/:id', getUserById);

export default router;
