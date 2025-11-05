/**
 * Session Store Adapter for D1 with Drizzle ORM
 *
 * Replaces Redis for session storage using Cloudflare D1
 * Compatible with koa-session
 */

import { eq, lt } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { schema } from './db/index';

interface SessionData {
  [key: string]: any;
  user_id?: string | number;
  userId?: string | number;
}

interface SessionStoreOptions {
  ttl?: number; // Time to live in milliseconds
}

/**
 * D1 Session Store using Drizzle ORM
 */
export class D1SessionStore {
  private db: DrizzleD1Database<typeof schema>;
  private ttl: number;

  constructor(db: DrizzleD1Database<typeof schema>, options: SessionStoreOptions = {}) {
    this.db = db;
    this.ttl = options.ttl || 86400000; // 24 hours default (in milliseconds)
  }

  /**
   * Get session by ID
   * @param sid - Session ID
   * @returns Session data or null if not found/expired
   */
  async get(sid: string): Promise<SessionData | null> {
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

      return JSON.parse(session.data) as SessionData;
    } catch (error) {
      console.error('Session get error:', error);
      return null;
    }
  }

  /**
   * Set/update session
   * @param sid - Session ID
   * @param session - Session data
   * @param maxAge - Max age in milliseconds
   * @returns Success status
   */
  async set(sid: string, session: SessionData, maxAge?: number): Promise<boolean> {
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
            userId: userId ? String(userId) : null,
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
            userId: userId ? String(userId) : null,
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
   * @param sid - Session ID
   * @returns Success status
   */
  async destroy(sid: string): Promise<boolean> {
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
   * @returns Number of sessions deleted
   */
  async cleanup(): Promise<number> {
    try {
      await this.db
        .delete(schema.sessions)
        .where(lt(schema.sessions.expiresAt, new Date().toISOString()));

      return 0; // Return 0 as we can't easily get row count from D1
    } catch (error) {
      console.error('Session cleanup error:', error);
      return 0;
    }
  }
}

/**
 * Factory function for use with koa-session or similar
 * @param db - Drizzle database instance
 * @param options - Store options
 * @returns Session store instance
 */
export function createSessionStore(
  db: DrizzleD1Database<typeof schema>,
  options?: SessionStoreOptions
): D1SessionStore {
  return new D1SessionStore(db, options);
}
