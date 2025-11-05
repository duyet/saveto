/**
 * Tests for Database Schema
 */

import { describe, it, expect } from 'vitest';
import * as schema from './schema';

describe('Database Schema', () => {
  describe('Sessions Table', () => {
    it('should have correct table structure', () => {
      expect(schema.sessions).toBeDefined();
      expect(schema.sessions.id).toBeDefined();
      expect(schema.sessions.data).toBeDefined();
      expect(schema.sessions.userId).toBeDefined();
      expect(schema.sessions.expiresAt).toBeDefined();
    });
  });

  describe('Users Table', () => {
    it('should have correct table structure', () => {
      expect(schema.users).toBeDefined();
      expect(schema.users.id).toBeDefined();
      expect(schema.users.username).toBeDefined();
      expect(schema.users.email).toBeDefined();
      expect(schema.users.password).toBeDefined();
      expect(schema.users.displayName).toBeDefined();
    });

    it('should have provider fields for OAuth', () => {
      expect(schema.users.provider).toBeDefined();
      expect(schema.users.providerId).toBeDefined();
    });

    it('should have timestamps', () => {
      expect(schema.users.createdAt).toBeDefined();
      expect(schema.users.updatedAt).toBeDefined();
    });
  });

  describe('URLs Table', () => {
    it('should have correct table structure', () => {
      expect(schema.urls).toBeDefined();
      expect(schema.urls.id).toBeDefined();
      expect(schema.urls.userId).toBeDefined();
      expect(schema.urls.slug).toBeDefined();
      expect(schema.urls.url).toBeDefined();
    });

    it('should have metadata fields', () => {
      expect(schema.urls.title).toBeDefined();
      expect(schema.urls.description).toBeDefined();
      expect(schema.urls.clicks).toBeDefined();
      expect(schema.urls.isPublic).toBeDefined();
    });
  });

  describe('Tags Table', () => {
    it('should have correct table structure', () => {
      expect(schema.tags).toBeDefined();
      expect(schema.tags.id).toBeDefined();
      expect(schema.tags.name).toBeDefined();
      expect(schema.tags.slug).toBeDefined();
    });
  });

  describe('URL Tags Junction Table', () => {
    it('should have correct table structure', () => {
      expect(schema.urlTags).toBeDefined();
      expect(schema.urlTags.id).toBeDefined();
      expect(schema.urlTags.urlId).toBeDefined();
      expect(schema.urlTags.tagId).toBeDefined();
    });
  });

  describe('Notes Table', () => {
    it('should have correct table structure', () => {
      expect(schema.notes).toBeDefined();
      expect(schema.notes.id).toBeDefined();
      expect(schema.notes.userId).toBeDefined();
      expect(schema.notes.slug).toBeDefined();
      expect(schema.notes.title).toBeDefined();
      expect(schema.notes.content).toBeDefined();
      expect(schema.notes.isPublic).toBeDefined();
    });
  });

  describe('TIL Table', () => {
    it('should have correct table structure', () => {
      expect(schema.til).toBeDefined();
      expect(schema.til.id).toBeDefined();
      expect(schema.til.userId).toBeDefined();
      expect(schema.til.slug).toBeDefined();
      expect(schema.til.title).toBeDefined();
      expect(schema.til.content).toBeDefined();
      expect(schema.til.tags).toBeDefined();
    });
  });

  describe('Applications Table', () => {
    it('should have correct table structure', () => {
      expect(schema.applications).toBeDefined();
      expect(schema.applications.id).toBeDefined();
      expect(schema.applications.userId).toBeDefined();
      expect(schema.applications.name).toBeDefined();
      expect(schema.applications.apiKey).toBeDefined();
      expect(schema.applications.isActive).toBeDefined();
    });
  });

  describe('Activity Logs Table', () => {
    it('should have correct table structure', () => {
      expect(schema.activityLogs).toBeDefined();
      expect(schema.activityLogs.id).toBeDefined();
      expect(schema.activityLogs.userId).toBeDefined();
      expect(schema.activityLogs.action).toBeDefined();
      expect(schema.activityLogs.resourceType).toBeDefined();
      expect(schema.activityLogs.resourceId).toBeDefined();
      expect(schema.activityLogs.ipAddress).toBeDefined();
      expect(schema.activityLogs.userAgent).toBeDefined();
    });
  });
});
