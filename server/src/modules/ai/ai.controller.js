import { generateOutlineService, generateFullDocumentModelService, generateSectionService, generateDiagramService } from './ai.service.js';
import { db } from '../../config/db.js';
import { documents, usageLogs, users } from '../../db/schema.js';

const handleAiError = (res, error) => {
  console.error('[AI Controller Error]', error.message);
  if (error.status === 429 || error.isQuotaExceeded || error.message?.includes('Quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
    return res.status(429).json({
      error: 'AI quota reached. Gemini API rate limit exceeded. Please wait a few seconds and try again.'
    });
  }
  return res.status(500).json({ error: error.message || 'AI Generation failed' });
};

export const writeSection = async (req, res) => {
  try {
    const { title, topic, targetClass } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Section title is required' });
    }
    const section = await generateSectionService({ title, topic, targetClass });
    res.json({ section });
  } catch (error) {
    handleAiError(res, error);
  }
};

export const generateOutline = async (req, res) => {
  try {
    const { topic, docType, referenceText, targetClass } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const outline = await generateOutlineService({ topic, docType, referenceText, targetClass });
    res.json({ outline });
  } catch (error) {
    handleAiError(res, error);
  }
};

export const generateFullDocument = async (req, res) => {
  try {
    const { topic, type = 'PDF', folderId, templateId, placeholders, outline, targetClass } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const contentJson = await generateFullDocumentModelService({
      topic,
      docType: type,
      templateId,
      placeholders,
      outline,
      targetClass: targetClass || placeholders?.class
    });

    let ownerId = req.user?.id;
    if (!ownerId) {
      const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
      if (existingUsers.length > 0) ownerId = existingUsers[0].id;
    }

    const docTitle = contentJson.outline?.title || contentJson.placeholders?.topic_title || topic;
    const docId = `doc_${Date.now()}`;
    const [newDoc] = await db.insert(documents).values({
      id: docId,
      title: docTitle,
      type: type.toUpperCase(),
      ownerId: ownerId || 'usr_default',
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
        metadata: { topic, docId: newDoc.id, type, targetClass: targetClass || placeholders?.class },
        createdAt: new Date(),
      }).catch(() => {});
    }

    res.status(201).json({ document: newDoc });
  } catch (error) {
    handleAiError(res, error);
  }
};

export const generateDiagram = async (req, res) => {
  try {
    const { prompt, diagramType = 'flowchart', topic = '' } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Diagram prompt is required' });
    }

    const result = await generateDiagramService({
      prompt: prompt.trim(),
      diagramType,
      topic,
    });

    // Log AI Usage
    if (req.user) {
      await db.insert(usageLogs).values({
        id: `log_diag_${Date.now()}`,
        userId: req.user.id,
        action: 'AI_DIAGRAM',
        metadata: { prompt: prompt.substring(0, 100), diagramType },
        createdAt: new Date(),
      }).catch(() => {});
    }

    res.json({
      diagram: {
        dataUrl: result.dataUrl,
        svgCode: result.svgCode,
        diagramType: result.diagramType,
      }
    });
  } catch (error) {
    handleAiError(res, error);
  }
};
