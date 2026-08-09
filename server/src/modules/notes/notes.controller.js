import { generateNotesOutlineService, generateNotesBlocksService, regenerateSingleBlockService, continueNotesService } from './notes.service.js';
import { db } from '../../config/db.js';
import { documents, users, noteAssets } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

const handleNotesError = (res, error) => {
  console.error('[Notes Controller Error]', error.message);
  if (error.status === 429 || error.message?.includes('Quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
    return res.status(429).json({
      error: 'AI quota reached. Please wait a few seconds and try again.'
    });
  }
  return res.status(500).json({ error: error.message || 'Notes Generation failed' });
};

export const generateNotesOutline = async (req, res) => {
  try {
    const { topic, referenceText, targetClass } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    const outline = await generateNotesOutlineService({ topic, referenceText, targetClass });
    res.json({ outline });
  } catch (error) {
    handleNotesError(res, error);
  }
};

export const createNotesDocument = async (req, res) => {
  try {
    const { topic, outline, styleConfig, targetClass } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const contentJson = await generateNotesBlocksService({ topic, outline, styleConfig, targetClass });

    let ownerId = req.user?.id;
    if (!ownerId) {
      const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
      if (existingUsers.length > 0) ownerId = existingUsers[0].id;
    }

    const docId = `note_${Date.now()}`;
    const docTitle = `${topic} — Handwritten Notes`;

    const [newDoc] = await db.insert(documents).values({
      id: docId,
      title: docTitle,
      type: 'NOTES',
      ownerId: ownerId || 'usr_default',
      status: 'DRAFT',
      contentJson,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.status(201).json({ document: newDoc });
  } catch (error) {
    handleNotesError(res, error);
  }
};

export const regenerateBlock = async (req, res) => {
  try {
    const { block, topic, styleConfig, targetClass } = req.body;
    if (!block) {
      return res.status(400).json({ error: 'Block data is required' });
    }
    const updatedBlock = await regenerateSingleBlockService({ block, topic, styleConfig, targetClass });
    res.json({ block: updatedBlock });
  } catch (error) {
    handleNotesError(res, error);
  }
};

export const continueNotes = async (req, res) => {
  try {
    const { documentTitle, existingPages, userInstruction, targetClass } = req.body;
    if (!documentTitle) {
      return res.status(400).json({ error: 'Document title is required' });
    }
    const continuation = await continueNotesService({ documentTitle, existingPages, userInstruction, targetClass });
    res.json({ pages: continuation.pages || [] });
  } catch (error) {
    handleNotesError(res, error);
  }
};

export const getNoteAssets = async (req, res) => {
  try {
    const { category } = req.query;
    let query = db.select().from(noteAssets);
    if (category) {
      query = query.where(eq(noteAssets.category, category));
    }
    const assets = await query;
    res.json({ assets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
