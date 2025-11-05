/**
 * Drizzle ORM Schema for Saveto D1 Database
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Sessions table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  data: text('data').notNull(),
  userId: text('user_id'),
  expiresAt: text('expires_at').notNull(), // ISO 8601 datetime
  createdAt: text('created_at').notNull().default("datetime('now')"),
  updatedAt: text('updated_at').notNull().default("datetime('now')"),
});

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').unique().notNull(),
  email: text('email').unique(),
  password: text('password'),
  displayName: text('display_name'),
  avatar: text('avatar'),
  provider: text('provider').default('local'), // 'local', 'github', etc.
  providerId: text('provider_id'),
  createdAt: text('created_at').notNull().default("datetime('now')"),
  updatedAt: text('updated_at').notNull().default("datetime('now')"),
});

// URLs table (shortened links)
export const urls = sqliteTable('urls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  slug: text('slug').unique().notNull(),
  url: text('url').notNull(),
  title: text('title'),
  description: text('description'),
  clicks: integer('clicks').default(0),
  isPublic: integer('is_public').default(1), // 0 = private, 1 = public
  createdAt: text('created_at').notNull().default("datetime('now')"),
  updatedAt: text('updated_at').notNull().default("datetime('now')"),
});

// Tags table
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  createdAt: text('created_at').notNull().default("datetime('now')"),
});

// URL-Tags junction table (many-to-many)
export const urlTags = sqliteTable('url_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  urlId: integer('url_id').notNull(),
  tagId: integer('tag_id').notNull(),
  createdAt: text('created_at').notNull().default("datetime('now')"),
});

// Notes table
export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  content: text('content'),
  isPublic: integer('is_public').default(1),
  createdAt: text('created_at').notNull().default("datetime('now')"),
  updatedAt: text('updated_at').notNull().default("datetime('now')"),
});

// TIL (Today I Learned) table
export const til = sqliteTable('til', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  content: text('content'),
  tags: text('tags'), // JSON array of tags
  isPublic: integer('is_public').default(1),
  createdAt: text('created_at').notNull().default("datetime('now')"),
  updatedAt: text('updated_at').notNull().default("datetime('now')"),
});

// Applications table (API keys)
export const applications = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  apiKey: text('api_key').unique().notNull(),
  isActive: integer('is_active').default(1),
  createdAt: text('created_at').notNull().default("datetime('now')"),
  updatedAt: text('updated_at').notNull().default("datetime('now')"),
});

// Activity logs table
export const activityLogs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id'),
  action: text('action').notNull(), // 'create', 'update', 'delete', 'view'
  resourceType: text('resource_type').notNull(), // 'url', 'note', 'til'
  resourceId: integer('resource_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull().default("datetime('now')"),
});
