import { eq } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { templates, documents } from '../../db/schema.js';
import { generateFullDocumentModelService } from '../ai/ai.service.js';

export const getTemplates = async (req, res) => {
  try {
    const { category } = req.query;

    let tpls = await db.select().from(templates).where(eq(templates.isPublic, true));
    if (category && category !== 'ALL') {
      tpls = tpls.filter((t) => t.category === category);
    }

    // Fallback seed templates if database table is initially empty
    if (tpls.length === 0) {
      tpls = [
        {
          id: 'tpl_physics_proj',
          name: 'Physics Investigatory Project',
          category: 'school-project',
          thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
          isPublic: true,
          schemaJson: {
            theme: {
              fontFamily: 'Georgia',
              primaryColor: '#2B4C7E',
              accentColor: '#C1663E',
              borderStyle: 'double-rule',
              backgroundColor: '#FAFAF8'
            },
            pageSequence: ['cover', 'certificate', 'declaration', 'acknowledgement', 'index', 'chapter', 'bibliography']
          }
        },
        {
          id: 'tpl_cert_excellence',
          name: 'Certificate of Achievement',
          category: 'certificate',
          thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
          isPublic: true,
          schemaJson: {
            theme: {
              fontFamily: 'Georgia',
              primaryColor: '#8B6508',
              accentColor: '#D4AF37',
              borderStyle: 'ornamental-corner',
              backgroundColor: '#FFFDF9'
            },
            pageSequence: ['certificate']
          }
        },
        {
          id: 'tpl_lab_report',
          name: 'Academic Research Report',
          category: 'report',
          thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
          isPublic: true,
          schemaJson: {
            theme: {
              fontFamily: 'Inter',
              primaryColor: '#1E293B',
              accentColor: '#2563EB',
              borderStyle: 'single-rule',
              backgroundColor: '#FFFFFF'
            },
            pageSequence: ['cover', 'abstract', 'introduction', 'methodology', 'results', 'conclusion']
          }
        }
      ];
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
    const tplName = id.includes('cert')
      ? 'Certificate of Achievement'
      : id.includes('lab')
        ? 'Academic Research Report'
        : 'Investigatory Project Report';

    const contentJson = await generateFullDocumentModelService({
      topic: tplName,
      templateId: id,
      docType: 'PDF'
    });

    const [newDoc] = await db.insert(documents).values({
      id: docId,
      title: tplName,
      type: 'PDF',
      ownerId: req.user ? req.user.id : 'usr_default',
      templateId: id,
      status: 'DRAFT',
      contentJson,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.status(201).json({ document: newDoc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
