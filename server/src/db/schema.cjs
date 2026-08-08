const { pgTable, text, timestamp, boolean, jsonb, pgEnum } = require('drizzle-orm/pg-core');

const roleEnum = pgEnum('role', ['USER', 'ADMIN', 'SUPERADMIN']);
const docTypeEnum = pgEnum('doc_type', ['PDF', 'PPTX', 'DOCX']);
const docStatusEnum = pgEnum('doc_status', ['GENERATING', 'DRAFT', 'FINALIZED']);

const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role').default('USER').notNull(),
  authProvider: text('auth_provider').default('credentials').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const folders = pgTable('folders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  parentId: text('parent_id'),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').default('PDF').notNull(),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  folderId: text('folder_id').references(() => folders.id, { onDelete: 'set null' }),
  templateId: text('template_id'),
  contentJson: jsonb('content_json').notNull(),
  status: text('status').default('DRAFT').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const documentVersions = pgTable('document_versions', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  contentJson: jsonb('content_json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const documentExports = pgTable('exports', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  format: text('format').notNull(),
  fileUrl: text('file_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const templates = pgTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  schemaJson: jsonb('schema_json').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  isPublic: boolean('is_public').default(true).notNull(),
  createdById: text('created_by_id'),
});

const usageLogs = pgTable('usage_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

module.exports = {
  roleEnum,
  docTypeEnum,
  docStatusEnum,
  users,
  folders,
  documents,
  documentVersions,
  documentExports,
  templates,
  usageLogs
};
