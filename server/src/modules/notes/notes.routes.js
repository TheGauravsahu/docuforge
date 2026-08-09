import { Router } from 'express';
import { generateNotesOutline, createNotesDocument, regenerateBlock, continueNotes, getNoteAssets } from './notes.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/outline', authenticate, generateNotesOutline);
router.post('/generate', authenticate, createNotesDocument);
router.post('/continue', authenticate, continueNotes);
router.post('/block/regenerate', authenticate, regenerateBlock);
router.get('/assets', authenticate, getNoteAssets);

export default router;
