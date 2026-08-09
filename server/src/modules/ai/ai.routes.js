import { Router } from 'express';
import { generateOutline, generateFullDocument, writeSection, generateDiagram } from './ai.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { aiLimiter } from '../../middleware/rateLimit.js';

const router = Router();

router.use(authenticate);

router.post('/outline', aiLimiter, generateOutline);
router.post('/generate', aiLimiter, generateFullDocument);
router.post('/write-section', aiLimiter, writeSection);
router.post('/diagram', aiLimiter, generateDiagram);

export default router;
