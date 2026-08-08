import { generateOutlineService, generateFullDocumentModelService, generateSectionService } from './ai.service.js';
import { db } from '../../config/db.js';
import { documents, usageLogs } from '../../db/schema.js';

export const writeSection = async (req, res) => {
  try {
    const { title, topic } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Section title is required' });
    }
    const section = await generateSectionService({ title, topic });
    res.json({ section });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateOutline = async (req, res) => {
  try {
    const { topic, docType, referenceText } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const outline = await generateOutlineService({ topic, docType, referenceText });
    res.json({ outline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateFullDocument = async (req, res) => {
  try {
    const { topic, type = 'PDF', folderId, templateId, placeholders, outline } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const contentJson = await generateFullDocumentModelService({
      topic,
      docType: type,
      templateId,
      placeholders,
      outline
    });

    const docTitle = contentJson.outline?.title || contentJson.placeholders?.topic_title || topic;
    const docId = `doc_${Date.now()}`;
    const [newDoc] = await db.insert(documents).values({
      id: docId,
      title: docTitle,
      type: type.toUpperCase(),
      ownerId: req.user ? req.user.id : 'usr_default',
      folderId: folderId || null,
      templateId: templateId || 'tpl_physics_proj',
      status: 'DRAFT',
      contentJson,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Log AI Usage
    if (req.user) {
      await db.insert(usageLogs).values({
        id: `log_${Date.now()}`,
        userId: req.user.id,
        action: 'AI_GENERATION',
        metadata: { topic, docId: newDoc.id, type },
        createdAt: new Date(),
      }).catch(() => {});
    }

    res.status(201).json({ document: newDoc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
