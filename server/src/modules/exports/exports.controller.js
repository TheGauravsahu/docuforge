import { eq } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { documents, documentExports, usageLogs } from '../../db/schema.js';
import { exportToPptx, exportToDocx, exportToPdfHtml } from './exports.service.js';

export const exportDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'PDF', contentJson } = req.body;

    const docs = await db.select().from(documents).where(eq(documents.id, id));
    const doc = docs[0];

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Use live contentJson from request if provided, and sync to DB
    const finalContentJson = contentJson || doc.contentJson;
    if (contentJson) {
      await db.update(documents).set({ contentJson, updatedAt: new Date() }).where(eq(documents.id, id)).catch(() => {});
    }

    const fmt = format.toUpperCase();
    let downloadUrl = '';

    if (fmt === 'PPTX') {
      downloadUrl = await exportToPptx(finalContentJson, doc.title);
    } else if (fmt === 'DOCX') {
      downloadUrl = await exportToDocx(finalContentJson, doc.title);
    } else {
      // PDF HTML printable format
      const htmlContent = exportToPdfHtml(finalContentJson, doc.title);
      return res.json({
        export: {
          id: `exp_${Date.now()}`,
          documentId: doc.id,
          format: 'PDF',
          htmlContent,
          createdAt: new Date().toISOString()
        }
      });
    }

    const expId = `exp_${Date.now()}`;
    const [exportRecord] = await db.insert(documentExports).values({
      id: expId,
      documentId: doc.id,
      format: fmt,
      fileUrl: downloadUrl,
      createdAt: new Date(),
    }).returning();

    if (req.user) {
      await db.insert(usageLogs).values({
        id: `log_${Date.now()}`,
        userId: req.user.id,
        action: 'EXPORT',
        metadata: { documentId: doc.id, format: fmt },
        createdAt: new Date(),
      }).catch(() => {});
    }

    res.json({ export: exportRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
