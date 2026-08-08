import { Router } from 'express';
import { getUsers, updateUserRole, deleteUser, getAnalytics } from './admin.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN', 'SUPERADMIN'));

router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/stats', getAnalytics);
router.get('/analytics', getAnalytics);

export default router;
