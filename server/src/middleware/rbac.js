import { eq, and } from 'drizzle-orm';
import { db } from '../config/db.js';
import { documents, folders } from '../db/schema.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      let resource = null;

      if (resourceType === 'document') {
        const docs = await db.select().from(documents).where(eq(documents.id, resourceId));
        resource = docs[0];
      } else if (resourceType === 'folder') {
        const flds = await db.select().from(folders).where(eq(folders.id, resourceId));
        resource = flds[0];
      }

      if (!resource) {
        return res.status(404).json({ error: `${resourceType} not found` });
      }

      if (resource.ownerId !== req.user.id && req.user.role === 'USER') {
        return res.status(403).json({ error: 'Forbidden: You do not own this resource' });
      }

      req.resource = resource;
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};
