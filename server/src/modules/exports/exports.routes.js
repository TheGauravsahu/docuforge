import { Router } from 'express';
import { exportDocument } from './exports.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/:id/export', exportDocument);

export default router;
