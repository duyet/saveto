# 🚀 Deploying Koa.js to Cloudflare Workers

This guide explains how to deploy your Koa.js app to Cloudflare Workers using Node.js compatibility with `httpServerHandler`.

---

## 📋 What We've Set Up

### 1. Workers Entry Point (`src/worker.js`)
- Uses `httpServerHandler` from `cloudflare:node` for seamless Koa.js integration
- Runs your Koa.js app on Workers with minimal adaptation
- Provides env.DB and env.CACHE to your app

### 2. Drizzle ORM (`src/db/`)
- Type-safe ORM for D1 (SQLite) database
- Modern query builder with full TypeScript support
- Schema defined in `src/db/schema.js`
- Database initialization in `src/db/index.js`

### 3. Session Store (`src/session-store.js`)
- Replaces Redis with D1 for sessions using Drizzle ORM
- Compatible with `koa-session`
- Auto-cleanup of expired sessions via cron triggers

---

## 🔧 Required Code Changes

### Step 1: Update `app.js` to Export the App

**Current** (`app.js` line 101):
```javascript
app = module.exports = http.createServer(app.callback());
if (!module.parent) {
  app.listen(config.port);
  console.info("Listen on http://localhost:%s", config.port);
}
```

**Change to**:
```javascript
// Export the Koa app instance (not the HTTP server)
module.exports = app;

// Only start HTTP server if not in Workers environment
if (typeof addEventListener === 'undefined' && !module.parent) {
  const server = http.createServer(app.callback());
  server.listen(config.port);
  console.info("Listen on http://localhost:%s", config.port);
}
```

### Step 2: Replace MongoDB with Drizzle ORM

**Install dependencies**:
```bash
npm install drizzle-orm
npm install -D drizzle-kit
```

**Use Drizzle in your code**:
```javascript
// Import Drizzle DB and schema
import { initDB, schema } from './src/db/index.js';
import { eq, gt, lt } from 'drizzle-orm';

// Initialize database (in worker or app startup)
const db = initDB(env.DB);

// Query examples
// Find user by username
const user = await db
  .select()
  .from(schema.users)
  .where(eq(schema.users.username, 'john'))
  .limit(1);

// Create new URL
await db.insert(schema.urls).values({
  userId: 1,
  slug: 'my-link',
  url: 'https://example.com',
  title: 'Example',
  clicks: 0,
  isPublic: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Update URL clicks
await db
  .update(schema.urls)
  .set({ clicks: sql`${schema.urls.clicks} + 1` })
  .where(eq(schema.urls.slug, 'my-link'));

// Delete old URLs
await db
  .delete(schema.urls)
  .where(lt(schema.urls.createdAt, '2020-01-01'));
```

### Step 3: Replace Redis Sessions with D1

**Update** `app.js`:
```javascript
// Before (Redis)
const middlewares = require('koa-middlewares');
app.use(middlewares.session({
  store: middlewares.RedisStore()
}));

// After (D1 Session Store with Drizzle)
import { initDB } from './src/db/index.js';
import { createSessionStore } from './src/session-store.js';

// Initialize in Workers fetch handler or app startup
const db = initDB(env.DB);

app.use(session({
  store: createSessionStore(db, {
    ttl: 86400000 // 24 hours
  })
}, app));
```

### Step 4: Update Worker Entry Point

**Edit** `src/worker.js`:

The worker is already set up using `httpServerHandler`. You just need to:
1. Uncomment the router imports after refactoring
2. Make sure app.js exports the Koa app (not HTTP server)

```javascript
import { httpServerHandler } from 'cloudflare:node';

const Koa = require('koa');
const app = new Koa();

// Set up your middleware and routes
// ... app configuration ...

// Start Koa on internal port
const PORT = 8080;
app.listen(PORT);

// Export httpServerHandler (this is all you need!)
export default httpServerHandler({ port: PORT });
```

---

## 🗄️ Database Migration

Your D1 database is already set up with the schema in `schema.sql`.

```bash
# Verify database exists
wrangler d1 list

# Run migrations
wrangler d1 execute saveto-db --file=./schema.sql

# Check data
wrangler d1 execute saveto-db --command "SELECT * FROM users LIMIT 5"
```

---

## 🚀 Deployment Steps

### 1. Update Account ID

Edit `wrangler.toml`:
```toml
account_id = "YOUR_ACTUAL_ACCOUNT_ID"  # Get from: wrangler whoami
```

### 2. Install Dependencies

```bash
npm install drizzle-orm
npm install -D drizzle-kit wrangler
```

### 3. Deploy

```bash
# Deploy to Cloudflare Workers
wrangler deploy

# Or use the deployment script
./deploy-cloudflare.sh deploy
```

---

## 🧪 Testing

### Test Locally with Wrangler
```bash
wrangler dev
# Visit http://localhost:8787
```

### Test with Your Existing Server
```bash
npm start
# Visit http://localhost:6969
```

Both should work! The code detects the environment.

---

## 🔄 MongoDB to Drizzle Migration Examples

### Before (Mongoose):
```javascript
const User = require('./app/model').User;

// Find
const user = await User.findOne({ username: 'john' });

// Create
const newUser = new User({ username: 'jane', email: 'jane@example.com' });
await newUser.save();

// Update
await User.updateOne({ username: 'john' }, { $set: { email: 'new@example.com' } });

// Delete
await User.deleteOne({ username: 'john' });
```

### After (Drizzle):
```javascript
import { initDB, schema } from './src/db/index.js';
import { eq } from 'drizzle-orm';

const db = initDB(env.DB);

// Find
const users = await db.select().from(schema.users).where(eq(schema.users.username, 'john'));
const user = users[0];

// Create
await db.insert(schema.users).values({
  username: 'jane',
  email: 'jane@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Update
await db.update(schema.users)
  .set({ email: 'new@example.com', updatedAt: new Date().toISOString() })
  .where(eq(schema.users.username, 'john'));

// Delete
await db.delete(schema.users).where(eq(schema.users.username, 'john'));
```

---

## ⚠️ Limitations & Considerations

### What Works ✅
- ✅ Koa.js with `nodejs_compat` and `httpServerHandler`
- ✅ HTTP requests/responses (seamless with httpServerHandler)
- ✅ D1 database with Drizzle ORM
- ✅ Sessions in D1
- ✅ File uploads (with R2)
- ✅ Most Node.js core modules

### What Needs Adaptation ⚙️
- MongoDB → Drizzle ORM (type-safe, modern)
- Redis → D1 or KV (we provide D1 session store)
- File system → R2 buckets
- Long-running operations → Durable Objects or queued

### What Won't Work ❌
- Native bindings
- Some npm packages that use unsupported APIs
- Operations > 50ms CPU time (free tier)

---

## 🔍 Debugging

### View Logs
```bash
wrangler tail
```

### Common Issues

**Error: "module not found"**
- Solution: Make sure imports use correct paths and file extensions

**Error: "CPU limit exceeded"**
- Solution: Optimize database queries, use caching, add indexes

**Error: "binding not found"**
- Solution: Check wrangler.toml has D1 and KV bindings configured

**Error: "httpServerHandler not found"**
- Solution: Make sure `compatibility_flags = ["nodejs_compat"]` is in wrangler.toml

---

## 📚 Migration Checklist

- [ ] Update `package.json` with drizzle-orm dependencies
- [ ] Create Drizzle schema in `src/db/schema.js`
- [ ] Update `app.js` to export Koa app (not HTTP server)
- [ ] Replace MongoDB queries with Drizzle ORM
- [ ] Replace Redis sessions with D1 session store
- [ ] Test locally with `wrangler dev`
- [ ] Deploy with `wrangler deploy`
- [ ] Monitor with `wrangler tail`
- [ ] Set up cron trigger for session cleanup (optional)

---

## 🆘 Need Help?

- Wrangler logs: `wrangler tail`
- Check D1 data: `wrangler d1 execute saveto-db --command "SELECT * FROM users LIMIT 5"`
- Workers docs: https://developers.cloudflare.com/workers/
- Drizzle docs: https://orm.drizzle.team/docs/overview

---

**Good luck with your deployment!** 🚀

The httpServerHandler approach makes running Koa.js on Workers incredibly simple, and Drizzle ORM provides type-safe, modern database access.
