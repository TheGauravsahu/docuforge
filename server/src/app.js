import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSwagger } from './docs/swagger.js';

import authRoutes from './modules/auth/auth.routes.js';
import folderRoutes from './modules/folders/folders.routes.js';
import documentRoutes from './modules/documents/documents.routes.js';
import templateRoutes from './modules/templates/templates.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import exportRoutes from './modules/exports/exports.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// HTTP Request Logger Middleware (Morgan-style)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${color}${res.statusCode}\x1b[0m - ${duration}ms`);
  });
  next();
});

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [ENV.CLIENT_ORIGIN, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'DocuForge Express API', timestamp: new Date().toISOString() });
});

// Swagger Documentation
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', exportRoutes);
app.use('/api/admin', adminRoutes);

// Central Error Handler
app.use(errorHandler);

export default app;
