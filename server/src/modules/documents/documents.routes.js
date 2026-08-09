import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadMedia,
  updateShareSettings,
  getSharedDocument
} from './documents.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Public route (no authentication required)
router.get('/share/:token', getSharedDocument);

// Protected routes (authentication required)
router.use(authenticate);

router.post('/upload-media', uploadMedia);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.post('/', createDocument);
router.put('/:id', updateDocument);
router.put('/:id/share', updateShareSettings);
router.delete('/:id', deleteDocument);

export default router;
