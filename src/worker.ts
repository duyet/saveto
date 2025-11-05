/**
 * Cloudflare Workers Entry Point for Saveto Koa.js App
 *
 * Uses httpServerHandler to run Koa.js on Cloudflare Workers with Node.js compatibility
 * This is the recommended approach from Cloudflare documentation
 */

import { httpServerHandler } from 'cloudflare:node';
import { initDB, schema } from './db/index';
import { lt } from 'drizzle-orm';
import Koa from 'koa';

/**
 * Cloudflare Workers environment bindings
 */
export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  UPLOADS?: R2Bucket;
  RATE_LIMITER?: RateLimit;
}

// Note: The app.js file needs to be modified to:
// 1. Export the Koa app instance (not the HTTP server)
// 2. Only call app.listen() when not in Workers environment
// 3. Replace MongoDB with Drizzle ORM
// 4. Replace Redis sessions with D1 sessions

// For now, we'll create a basic Koa app setup
// TODO: Import from ../app.js after refactoring
const app = new Koa();

// Basic middleware
app.use(async (ctx, next) => {
  ctx.set('X-Powered-By', 'Cloudflare Workers + Koa.js');
  await next();
});

// Health check endpoint
app.use(async (ctx, next) => {
  if (ctx.path === '/health') {
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
    return;
  }
  await next();
});

// Import routes (TODO: adapt to use Drizzle instead of MongoDB)
// const router = require('../app/router');
// app.use(router.routes());
// app.use(router.allowedMethods());

// Temporary welcome route
app.use(async (ctx) => {
  ctx.body = 'Saveto on Cloudflare Workers! 🚀';
});

// Start the Koa server on internal port
const PORT = 8080;
app.listen(PORT);

console.log(`Koa app listening on port ${PORT}`);

/**
 * Export the httpServerHandler as default
 * This tells Cloudflare Workers to proxy requests to our Koa app
 */
export default httpServerHandler({ port: PORT });

/**
 * Optional: Scheduled handler for cron triggers
 * Add this to wrangler.toml:
 *
 * [triggers]
 * crons = ["0 0 * * *"]  # Daily at midnight
 */
export const scheduled: ExportedHandlerScheduledHandler<Env> = async (event, env, ctx) => {
  const db = initDB(env.DB);

  // Clean up expired sessions
  try {
    const result = await db.delete(schema.sessions)
      .where(lt(schema.sessions.expiresAt, new Date().toISOString()));

    console.log('Expired sessions cleaned up:', result);
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
};
