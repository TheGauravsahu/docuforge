import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { users } from '../../db/schema.js';
import { ENV } from '../../config/env.js';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing user in Neon DB
    const existingUsers = await db.select().from(users).where(eq(users.email, cleanEmail));
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered. Please login.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const [newUser] = await db.insert(users).values({
      id: userId,
      email: cleanEmail,
      name,
      passwordHash,
      role: 'USER',
      avatarUrl: defaultAvatar,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query Neon DB
    const existingUsers = await db.select().from(users).where(eq(users.email, cleanEmail));
    const user = existingUsers[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || '');
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const existingUsers = await db.select().from(users).where(eq(users.id, req.user.id));
    const user = existingUsers[0] || req.user;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, avatarUrl, password } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase().trim();
    if (avatarUrl) updates.avatarUrl = avatarUrl;
    if (password && password.trim().length > 0) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }
    updates.updatedAt = new Date();

    const [updatedUser] = await db.update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userPayload = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
    };

    res.json({ user: userPayload, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
