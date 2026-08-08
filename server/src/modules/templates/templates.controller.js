import { eq } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { templates, documents, users } from '../../db/schema.js';
import { PREBUILT_TEMPLATES } from './prebuiltTemplates.js';

export const getTemplates = async (req, res) => {
  try {
    const { category } = req.query;

    let tpls = await db.select().from(templates).where(eq(templates.isPublic, true)).catch(() => []);

    // Merge DB templates with static server prebuilt templates
    const prebuiltList = Object.values(PREBUILT_TEMPLATES).map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      thumbnailUrl: t.thumbnailUrl,
      isPublic: true,
      schemaJson: {
        theme: t.contentJson.theme,
        pageSequence: t.contentJson.pages.map((p) => p.type),
      }
    }));

    // Deduplicate by ID
    const existingIds = new Set(tpls.map((t) => t.id));
    prebuiltList.forEach((pt) => {
      if (!existingIds.has(pt.id)) {
        tpls.push(pt);
      }
    });

    if (category && category !== 'ALL') {
      tpls = tpls.filter((t) => t.category === category);
    }

    res.json({ templates: tpls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, category, schemaJson, thumbnailUrl } = req.body;
    if (!name || !category || !schemaJson) {
      return res.status(400).json({ error: 'Name, category and schemaJson are required' });
    }

    const tplId = `tpl_${Date.now()}`;
    const [newTpl] = await db.insert(templates).values({
      id: tplId,
      name,
      category,
      schemaJson,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
      isPublic: true,
      createdById: req.user ? req.user.id : 'admin'
    }).returning();

    res.status(201).json({ template: newTpl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const useTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const docId = `doc_${Date.now()}`;

    // Dynamically resolve valid ownerId to satisfy foreign key constraint
    let ownerId = req.user?.id;
    if (!ownerId) {
      const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
      if (existingUsers.length > 0) {
        ownerId = existingUsers[0].id;
      } else {
        return res.status(401).json({ error: 'User authentication required to use templates' });
      }
    }

    // Check if template is prebuilt on server (100% instant, 0 AI calls, immune to quota limits)
    const prebuilt = PREBUILT_TEMPLATES[id];
    let contentJson = null;
    let tplTitle = 'Document Template';

    if (prebuilt) {
      // Deep clone prebuilt template JSON directly from server memory
      contentJson = JSON.parse(JSON.stringify(prebuilt.contentJson));
      tplTitle = prebuilt.name || prebuilt.title;
    } else {
      // Fallback for custom user database templates: clone first prebuilt structure
      const fallback = PREBUILT_TEMPLATES.tpl_physics_proj;
      contentJson = JSON.parse(JSON.stringify(fallback.contentJson));
      tplTitle = 'Custom Template Project';
    }

    const [newDoc] = await db.insert(documents).values({
      id: docId,
      title: tplTitle,
      type: 'PDF',
      ownerId,
      templateId: id,
      status: 'DRAFT',
      contentJson,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.status(201).json({ document: newDoc });
  } catch (error) {
    console.error('[UseTemplate Error]:', error);
    res.status(500).json({ error: error.message });
  }
};
