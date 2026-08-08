import { eq, and, ilike } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { documents, templates } from '../../db/schema.js';
import { uploadToImageKit } from '../../config/imagekit.js';

export const getDocuments = async (req, res) => {
  try {
    const { folderId, search, type } = req.query;

    const conditions = [eq(documents.ownerId, req.user.id)];
    if (folderId) conditions.push(eq(documents.folderId, String(folderId)));
    if (type && type !== 'ALL') conditions.push(eq(documents.type, String(type).toUpperCase()));
    if (search) conditions.push(ilike(documents.title, `%${search}%`));

    const userDocs = await db.select().from(documents).where(and(...conditions));
    res.json({ documents: userDocs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const docs = await db.select().from(documents).where(eq(documents.id, id));
    const doc = docs[0];

    if (!doc || (doc.ownerId !== req.user.id && req.user.role === 'USER')) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const { title, type = 'PDF', folderId, templateId, contentJson } = req.body;

    let initialContent = contentJson;
    if (!initialContent && templateId) {
      const tpls = await db.select().from(templates).where(eq(templates.id, templateId));
      const tpl = tpls[0];
      if (tpl) {
        initialContent = {
          theme: tpl.schemaJson.theme,
          placeholders: {},
          pages: [
            {
              id: `p_${Date.now()}_1`,
              type: 'cover',
              title: 'Cover Page',
              elements: [
                { id: 'el_1', type: 'text', content: title || 'UNTITLED PROJECT', fontSize: 24, fontWeight: 'bold', align: 'center', y: 80 },
                { id: 'el_2', type: 'text', content: 'Subheading or Topic Description', fontSize: 16, align: 'center', y: 130 }
              ]
            }
          ]
        };
      }
    }

    if (!initialContent) {
      initialContent = {
        theme: {
          fontFamily: 'Georgia',
          primaryColor: '#2B4C7E',
          accentColor: '#C1663E',
          borderStyle: 'double-rule',
          backgroundColor: '#FAFAF8'
        },
        placeholders: {},
        pages: [
          {
            id: `p_${Date.now()}_1`,
            type: 'cover',
            title: 'Cover Page',
            elements: [
              { id: 'el_title', type: 'text', content: title || 'New Document Project', fontSize: 22, fontWeight: 'bold', align: 'center', y: 100 }
            ]
          }
        ]
      };
    }

    const docId = `doc_${Date.now()}`;
    const [newDoc] = await db.insert(documents).values({
      id: docId,
      title: title || 'Untitled Project',
      type: type.toUpperCase(),
      ownerId: req.user.id,
      folderId: folderId || null,
      templateId: templateId || null,
      status: 'DRAFT',
      contentJson: initialContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.status(201).json({ document: newDoc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, folderId, status, contentJson } = req.body;

    const [updatedDoc] = await db.update(documents)
      .set({
        ...(title && { title }),
        ...(folderId !== undefined && { folderId }),
        ...(status && { status }),
        ...(contentJson && { contentJson }),
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, id), eq(documents.ownerId, req.user.id)))
      .returning();

    if (!updatedDoc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document: updatedDoc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.delete(documents).where(and(eq(documents.id, id), eq(documents.ownerId, req.user.id))).returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    const { imageBase64, imageUrl: urlInput, filename } = req.body;
    
    if (urlInput) {
      return res.json({ url: urlInput, message: 'Image URL processed' });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const mediaUrl = await uploadToImageKit({
      file: imageBase64,
      fileName: filename || `docuforge_${Date.now()}.png`,
    });

    res.json({ url: mediaUrl, message: 'Image uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
