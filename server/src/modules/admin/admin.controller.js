import { eq } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { users, documents, documentExports, usageLogs } from '../../db/schema.js';
import { cache } from '../../config/redis.js';

export const getUsers = async (req, res) => {
  try {
    const userList = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    }).from(users);

    res.json({ users: userList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const [updatedUser] = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db.delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const cachedStats = await cache.get('admin:stats');
    if (cachedStats) {
      return res.json(cachedStats);
    }

    const allUsers = await db.select().from(users);
    const allDocs = await db.select().from(documents);
    const allExports = await db.select().from(documentExports);
    const logs = await db.select().from(usageLogs);

    const totalUsers = allUsers.length;
    const totalDocuments = allDocs.length;
    const totalExports = allExports.length;
    const totalGenerations = logs.filter((l) => l.action === 'AI_GENERATION').length;
    const estimatedTokenSpend = (totalGenerations * 1250 * 0.00002).toFixed(2);

    const statsResult = {
      totalUsers,
      totalDocuments,
      totalTemplates: 3,
      totalGenerations,
      metrics: {
        totalUsers,
        totalDocuments,
        totalExports,
        totalGenerations,
        estimatedTokenSpend: `$${estimatedTokenSpend}`,
        activeQueues: 0
      },
      logs: logs.slice(-20)
    };

    await cache.set('admin:stats', statsResult, 30); // cache for 30 seconds
    res.json(statsResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
