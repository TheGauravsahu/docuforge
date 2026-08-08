import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const schema = require('./schema.cjs');

export const roleEnum = schema.roleEnum;
export const docTypeEnum = schema.docTypeEnum;
export const docStatusEnum = schema.docStatusEnum;
export const users = schema.users;
export const folders = schema.folders;
export const documents = schema.documents;
export const documentVersions = schema.documentVersions;
export const documentExports = schema.documentExports;
export const templates = schema.templates;
export const usageLogs = schema.usageLogs;
