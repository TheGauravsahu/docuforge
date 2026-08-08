import { eq, and } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { folders } from '../../db/schema.js';

export const getFolders = async (req, res) => {
  try {
    const userFolders = await db.select().from(folders).where(eq(folders.ownerId, req.user.id));
    res.json({ folders: userFolders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const folderId = `fld_${Date.now()}`;
    const [newFolder] = await db.insert(folders).values({
      id: folderId,
      name,
      parentId: parentId || null,
      ownerId: req.user.id,
      createdAt: new Date(),
    }).returning();

    res.status(201).json({ folder: newFolder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const [updatedFolder] = await db.update(folders)
      .set({
        ...(name && { name }),
        ...(parentId !== undefined && { parentId }),
      })
      .where(and(eq(folders.id, id), eq(folders.ownerId, req.user.id)))
      .returning();

    if (!updatedFolder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json({ folder: updatedFolder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.delete(folders).where(and(eq(folders.id, id), eq(folders.ownerId, req.user.id))).returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
