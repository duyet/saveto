/**
 * Drizzle ORM Database Connection for Cloudflare D1
 */

import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

/**
 * Initialize Drizzle ORM with D1 database
 * @param d1 - Cloudflare D1 database binding
 * @returns Drizzle database instance with schema
 */
export function initDB(d1: D1Database): DrizzleD1Database<typeof schema> {
  return drizzle(d1, { schema });
}

/**
 * Export schema for use in queries
 */
export { schema };

/**
 * Export types from schema
 */
export type {
  Session,
  NewSession,
  User,
  NewUser,
  Url,
  NewUrl,
  Tag,
  NewTag,
  Note,
  NewNote,
  Til,
  NewTil,
  Application,
  NewApplication,
  ActivityLog,
  NewActivityLog,
} from './schema';
