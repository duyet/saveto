/**
 * Session Store Adapter for D1 with Drizzle ORM
 *
 * Replaces Redis for session storage using Cloudflare D1
 * Compatible with koa-session
 */

import { eq, lt } from 'drizzle-orm';
import { schema } from './db/index.js';

/**
 * D1 Session Store using Drizzle ORM
 */
export class D1SessionStore {
  constructor(db, options = {}) {
    this.db = db;
    this.ttl = options.ttl || 86400000; // 24 hours default (in milliseconds)
  }

  /**
   * Get session by ID
   * @param {string} sid - Session ID
   * @returns {Promise<Object|null>} Session data or null if not found/expired
   */
  async get(sid) {
    try {
      const result = await this.db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.id, sid))
        .limit(1);

      if (!result || result.length === 0) return null;

      const session = result[0];

      // Check if session is expired
      const expiresAt = new Date(session.expiresAt);
      if (expiresAt < new Date()) {
        // Session expired, delete it
        await this.destroy(sid);
        return null;
      }

      return JSON.parse(session.data);
    } catch (error) {
      console.error('Session get error:', error);
      return null;
    }
  }

  /**
   * Set/update session
   * @param {string} sid - Session ID
   * @param {Object} session - Session data
   * @param {number} maxAge - Max age in milliseconds
   * @returns {Promise<boolean>} Success status
   */
  async set(sid, session, maxAge) {
    try {
      const ttl = maxAge || this.ttl;
      const expiresAt = new Date(Date.now() + ttl).toISOString();
      const data = JSON.stringify(session);
      const userId = session.user_id || session.userId || null;

      // Check if session exists
      const existing = await this.db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.id, sid))
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing session
        await this.db
          .update(schema.sessions)
          .set({
            data,
            userId,
            expiresAt,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.sessions.id, sid));
      } else {
        // Insert new session
        await this.db
          .insert(schema.sessions)
          .values({
            id: sid,
            data,
            userId,
            expiresAt,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
      }

      return true;
    } catch (error) {
      console.error('Session set error:', error);
      return false;
    }
  }

  /**
   * Destroy session
   * @param {string} sid - Session ID
   * @returns {Promise<boolean>} Success status
   */
  async destroy(sid) {
    try {
      await this.db
        .delete(schema.sessions)
        .where(eq(schema.sessions.id, sid));

      return true;
    } catch (error) {
      console.error('Session destroy error:', error);
      return false;
    }
  }

  /**
   * Clean up expired sessions
   * Call this periodically via Cron Trigger
   * @returns {Promise<number>} Number of sessions deleted
   */
  async cleanup() {
    try {
      const result = await this.db
        .delete(schema.sessions)
        .where(lt(schema.sessions.expiresAt, new Date().toISOString()));

      return result.rowsAffected || 0;
    } catch (error) {
      console.error('Session cleanup error:', error);
      return 0;
    }
  }
}

/**
 * Factory function for use with koa-session or similar
 * @param {DrizzleD1Database} db - Drizzle database instance
 * @param {Object} options - Store options
 * @returns {D1SessionStore} Session store instance
 */
export function createSessionStore(db, options) {
  return new D1SessionStore(db, options);
}
