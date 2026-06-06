/**
 * Tests for Database Initialization
 */

import { describe, it, expect } from 'vitest';
import { initDB } from './index';
import { MockD1Database } from '../test/mocks';

describe('Database Initialization', () => {
  it('should initialize Drizzle with D1 database', () => {
    const mockD1 = new MockD1Database();
    const db = initDB(mockD1);

    expect(db).toBeDefined();
    expect(typeof db.select).toBe('function');
    expect(typeof db.insert).toBe('function');
    expect(typeof db.update).toBe('function');
    expect(typeof db.delete).toBe('function');
  });

  it('should return a database instance with schema', () => {
    const mockD1 = new MockD1Database();
    const db = initDB(mockD1);

    expect(db).toBeDefined();
    // Drizzle database should have query builder methods
    expect(db).toHaveProperty('select');
    expect(db).toHaveProperty('insert');
    expect(db).toHaveProperty('update');
    expect(db).toHaveProperty('delete');
  });
});
