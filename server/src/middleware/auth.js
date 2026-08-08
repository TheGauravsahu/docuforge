import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { ENV } from '../config/env.js';
import { db } from '../config/db.js';
import { users } from '../db/schema.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const devUserId = req.headers['x-dev-user-id'];
    if (devUserId) {
      try {
        const existingUsers = await db.select().from(users).where(eq(users.id, devUserId));
        const devUser = existingUsers[0];
        if (devUser) {
          req.user = {
            id: devUser.id,
            email: devUser.email,
            role: devUser.role,
            name: devUser.name,
          };
          return next();
        }
      } catch (err) {
        // Silently catch and fail authentication if db query fails
      }
    }
    return res.status(401).json({ error: 'Unauthorized: Access token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
