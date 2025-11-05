/**
 * Drizzle ORM Database Connection for Cloudflare D1
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema.js';

/**
 * Initialize Drizzle ORM with D1 database
 * @param {D1Database} d1 - Cloudflare D1 database binding
 * @returns {DrizzleD1Database} Drizzle database instance
 */
export function initDB(d1) {
  return drizzle(d1, { schema });
}

/**
 * Export schema for use in queries
 */
export { schema };
