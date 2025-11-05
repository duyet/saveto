/**
 * Mock implementations for Cloudflare Workers APIs
 */

import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

/**
 * Mock D1 Database
 * Creates an in-memory SQLite database for testing
 */
export class MockD1Database implements D1Database {
  private statements: Map<string, any[]> = new Map();

  async prepare(query: string) {
    return {
      bind: (...values: any[]) => {
        this.statements.set(query, values);
        return {
          run: async () => ({ success: true, meta: {} }),
          all: async () => ({ success: true, results: [], meta: {} }),
          first: async (column?: string) => null,
          raw: async () => [],
        };
      },
      run: async () => ({ success: true, meta: {} }),
      all: async () => ({ success: true, results: [], meta: {} }),
      first: async (column?: string) => null,
      raw: async () => [],
    };
  }

  async dump() {
    return new ArrayBuffer(0);
  }

  async batch(statements: D1PreparedStatement[]) {
    return statements.map(() => ({ success: true, meta: {}, results: [] }));
  }

  async exec(query: string) {
    return {
      count: 0,
      duration: 0,
    };
  }
}

/**
 * Create a mock Drizzle database for testing
 */
export function createMockDB(): DrizzleD1Database<typeof schema> {
  const mockD1 = new MockD1Database();
  return drizzle(mockD1, { schema });
}

/**
 * Mock KV Namespace
 */
export class MockKVNamespace implements KVNamespace {
  private store: Map<string, { value: string; metadata?: any; expiration?: number }> = new Map();

  async get(
    key: string,
    options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream'; cacheTtl?: number }
  ): Promise<any> {
    const item = this.store.get(key);
    if (!item) return null;

    // Check expiration
    if (item.expiration && item.expiration < Date.now()) {
      this.store.delete(key);
      return null;
    }

    if (options?.type === 'json') {
      return JSON.parse(item.value);
    }
    return item.value;
  }

  async getWithMetadata(
    key: string,
    options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream'; cacheTtl?: number }
  ): Promise<{ value: any; metadata: any }> {
    const item = this.store.get(key);
    if (!item) return { value: null, metadata: null };

    let value = item.value;
    if (options?.type === 'json') {
      value = JSON.parse(value);
    }

    return { value, metadata: item.metadata };
  }

  async put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: {
      expiration?: number;
      expirationTtl?: number;
      metadata?: any;
    }
  ): Promise<void> {
    const stringValue = typeof value === 'string' ? value : String(value);
    const expiration = options?.expirationTtl
      ? Date.now() + options.expirationTtl * 1000
      : options?.expiration
      ? options.expiration * 1000
      : undefined;

    this.store.set(key, {
      value: stringValue,
      metadata: options?.metadata,
      expiration,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{ keys: { name: string; expiration?: number; metadata?: any }[]; list_complete: boolean; cursor?: string }> {
    const keys = Array.from(this.store.keys())
      .filter(k => !options?.prefix || k.startsWith(options.prefix))
      .slice(0, options?.limit || 1000)
      .map(name => ({
        name,
        expiration: this.store.get(name)?.expiration,
        metadata: this.store.get(name)?.metadata,
      }));

    return {
      keys,
      list_complete: true,
    };
  }
}

/**
 * Mock Environment bindings
 */
export function createMockEnv(): {
  DB: D1Database;
  CACHE: KVNamespace;
} {
  return {
    DB: new MockD1Database(),
    CACHE: new MockKVNamespace(),
  };
}
