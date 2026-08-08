import { Router } from 'express';
import { getTemplates, createTemplate, useTemplate } from './templates.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/', getTemplates);
router.post('/', authenticate, createTemplate);
router.post('/:id/use', useTemplate);

export default router;
