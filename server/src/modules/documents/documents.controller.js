import { eq, and, ilike } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { documents, templates } from '../../db/schema.js';
import { uploadToImageKit } from '../../config/imagekit.js';
import crypto from 'crypto';

// Robust helper to unpack single or double-encoded JSONB objects
const safeParseJson = (val) => {
  let res = val;
  let attempts = 0;
  while (typeof res === 'string' && attempts < 5) {
    try {
      res = JSON.parse(res);
    } catch (e) {
      break;
    }
    attempts++;
  }
  return res && typeof res === 'object' ? res : {};
};

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

    const existingDocs = await db.select().from(documents).where(
      and(eq(documents.id, id), eq(documents.ownerId, req.user.id))
    );
    const existingDoc = existingDocs[0];

    if (!existingDoc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    let finalContentJson = safeParseJson(contentJson);
    const existingContent = safeParseJson(existingDoc.contentJson);

    // Preserve existing shareSettings if not provided in incoming contentJson payload
    if (existingContent.shareSettings && !finalContentJson.shareSettings) {
      finalContentJson.shareSettings = existingContent.shareSettings;
    }

    const [updatedDoc] = await db.update(documents)
      .set({
        ...(title && { title }),
        ...(folderId !== undefined && { folderId }),
        ...(status && { status }),
        ...(finalContentJson && { contentJson: finalContentJson }),
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, id), eq(documents.ownerId, req.user.id)))
      .returning();

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

// ─── SHARE SETTINGS ───────────────────────────────────────────────────────────

export const updateShareSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility, password } = req.body;

    const validVisibilities = ['PRIVATE', 'PUBLIC', 'LINK', 'PASSWORD'];
    if (!validVisibilities.includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility setting' });
    }

    if (visibility === 'PASSWORD' && (!password || password.trim().length < 4)) {
      return res.status(400).json({ error: 'Password must be at least 4 characters for password-protected links' });
    }

    const docs = await db.select().from(documents).where(
      and(eq(documents.id, id), eq(documents.ownerId, req.user.id))
    );
    const doc = docs[0];
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const existingContent = safeParseJson(doc.contentJson);
    const existingShare = existingContent.shareSettings || {};
    const shareToken = existingShare.token || crypto.randomBytes(12).toString('hex');

    let passwordHash = existingShare.passwordHash || null;
    if (visibility === 'PASSWORD' && password && password.trim()) {
      passwordHash = crypto.createHash('sha256').update(password.trim()).digest('hex');
    } else if (visibility !== 'PASSWORD') {
      passwordHash = null;
    }

    const updatedContentJson = {
      ...existingContent,
      shareSettings: {
        visibility,
        token: shareToken,
        passwordHash,
        sharedAt: new Date().toISOString(),
      },
    };

    const [updatedDoc] = await db.update(documents)
      .set({ contentJson: updatedContentJson, updatedAt: new Date() })
      .where(and(eq(documents.id, id), eq(documents.ownerId, req.user.id)))
      .returning();

    console.log(`[ShareSettings] Updated doc ${id} with token ${shareToken} (visibility: ${visibility})`);

    res.json({
      shareToken,
      visibility,
      shareUrl: `${req.headers.origin || 'http://localhost:5173'}/p/${shareToken}`,
      document: updatedDoc,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── PUBLIC SHARE VIEW (no auth required) ────────────────────────────────────

export const getSharedDocument = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.query;

    console.log(`[GetSharedDocument] Incoming request for token/id: "${token}"`);

    if (!token) {
      return res.status(400).json({ error: 'Share token is required' });
    }

    // Query all documents
    const allDocs = await db.select({
      id: documents.id,
      title: documents.title,
      type: documents.type,
      contentJson: documents.contentJson,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
    }).from(documents);

    const doc = allDocs.find((d) => {
      const cJson = safeParseJson(d.contentJson);
      return d.id === token || cJson?.shareSettings?.token === token;
    });

    if (!doc) {
      console.warn(`[GetSharedDocument] ❌ No doc found matching token "${token}". Total docs in DB: ${allDocs.length}`);
      return res.status(404).json({ error: 'Shared document not found or link has been disabled' });
    }

    const parsedContent = safeParseJson(doc.contentJson);
    const share = parsedContent.shareSettings || {};

    // Default visibility to 'LINK' if token matches, unless explicitly marked PRIVATE
    const activeVisibility = share.visibility || 'LINK';
    console.log(`[GetSharedDocument] ✅ Doc "${doc.title}" (${doc.id}) found! Active visibility: ${activeVisibility}`);

    if (activeVisibility === 'PRIVATE') {
      return res.status(403).json({ error: 'This document is private' });
    }

    // Password protection check
    if (activeVisibility === 'PASSWORD') {
      if (!password) {
        return res.status(401).json({ error: 'PASSWORD_REQUIRED', message: 'This document is password protected' });
      }
      const inputHash = crypto.createHash('sha256').update(password).digest('hex');
      if (inputHash !== share.passwordHash) {
        return res.status(401).json({ error: 'WRONG_PASSWORD', message: 'Incorrect password' });
      }
    }

    // Return safe document (strip password hash)
    const safeContentJson = { ...parsedContent };
    if (safeContentJson.shareSettings) {
      safeContentJson.shareSettings = {
        visibility: safeContentJson.shareSettings.visibility,
        token: safeContentJson.shareSettings.token,
      };
    }

    res.json({
      document: {
        id: doc.id,
        title: doc.title,
        type: doc.type,
        contentJson: safeContentJson,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }
    });
  } catch (error) {
    console.error(`[GetSharedDocument Error]`, error);
    res.status(500).json({ error: error.message });
  }
};
