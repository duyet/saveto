# 🌐 Cloudflare Workers Setup via Web UI

This guide shows you how to set up your Saveto project using the Cloudflare web dashboard instead of command-line tools.

---

## 📋 Prerequisites

- A Cloudflare account (sign up at https://dash.cloudflare.com/sign-up)
- Your GitHub repository

---

## Part 1: Create D1 Database (Web UI)

### Step 1: Navigate to D1 Dashboard

1. Go to https://dash.cloudflare.com/
2. Click on **Workers & Pages** in the left sidebar
3. Click on **D1** tab at the top

### Step 2: Create Database

1. Click **"Create database"** button
2. **Database name**: `saveto-db`
3. Click **"Create"**

✅ Your database is created!

### Step 3: Run Database Migrations

1. Click on your newly created `saveto-db` database
2. Click on **"Console"** tab
3. Copy the entire contents of your `schema.sql` file
4. Paste into the console
5. Click **"Execute"**

✅ Your database schema is now set up!

**Repeat for staging and production:**
- Create `saveto-db-staging`
- Create `saveto-db-production`
- Run migrations on each

---

## Part 2: Create KV Namespace (Web UI)

### Step 1: Navigate to KV Dashboard

1. From https://dash.cloudflare.com/
2. Click **Workers & Pages** → **KV** tab

### Step 2: Create Namespace

1. Click **"Create namespace"** button
2. **Namespace name**: `CACHE`
3. Click **"Add"**

✅ Copy the **Namespace ID** shown - you'll need it later!

---

## Part 3: Create Workers (Web UI)

### Step 1: Navigate to Workers Dashboard

1. Go to https://dash.cloudflare.com/
2. Click **Workers & Pages** → **Overview**

### Step 2: Create Worker

1. Click **"Create application"** button
2. Click **"Create Worker"** button
3. **Worker name**: `saveto` (or your preferred name)
4. Click **"Deploy"**

✅ Your Worker is created!

### Step 3: Upload Your Code

**Option A: Using Wrangler CLI (Recommended)**
```bash
# After creating the Worker in UI, deploy your code:
wrangler deploy
```

**Option B: Manual Upload**
1. Click on your Worker
2. Click **"Edit code"**
3. Copy/paste your Worker code
4. Click **"Save and Deploy"**

---

## Part 4: Bind D1 Database to Worker

### Step 1: Go to Worker Settings

1. Click on your Worker (`saveto`)
2. Click **"Settings"** tab
3. Scroll to **"Bindings"** section

### Step 2: Add D1 Binding

1. Click **"Add binding"** under **D1 Databases**
2. **Variable name**: `DB`
3. **D1 database**: Select `saveto-db`
4. Click **"Save"**

✅ Your Worker can now access the database!

---

## Part 5: Bind KV Namespace to Worker

### Still in Worker Settings

1. Scroll to **"KV Namespace Bindings"**
2. Click **"Add binding"**
3. **Variable name**: `CACHE`
4. **KV namespace**: Select your `CACHE` namespace
5. Click **"Save"**

✅ Your Worker can now use KV storage!

---

## Part 6: Set Environment Variables

### Step 1: Add Secrets

1. Still in Worker Settings
2. Scroll to **"Environment Variables"** section
3. Click **"Add variable"**

### Step 2: Add Each Secret

Add these one by one:

**Variable 1:**
- **Variable name**: `SECRET_KEY`
- **Type**: Encrypt (check the box)
- **Value**: Your secret key
- Click **"Save"**

**Variable 2:**
- **Variable name**: `SESSION_SECRET`
- **Type**: Encrypt
- **Value**: Your session secret
- Click **"Save"**

**Variable 3:**
- **Variable name**: `GITHUB_CLIENT_ID`
- **Type**: Encrypt (optional)
- **Value**: Your GitHub OAuth Client ID
- Click **"Save"**

**Variable 4:**
- **Variable name**: `GITHUB_CLIENT_SECRET`
- **Type**: Encrypt
- **Value**: Your GitHub OAuth Client Secret
- Click **"Save"**

✅ All secrets are configured!

---

## Part 7: Deploy Static Assets (Cloudflare Pages)

### Step 1: Connect GitHub Repository

1. Go to https://dash.cloudflare.com/
2. Click **Workers & Pages** → **Pages** tab
3. Click **"Create application"**
4. Click **"Connect to Git"**
5. Click **"Connect GitHub"**
6. Authorize Cloudflare
7. Select your `saveto` repository

### Step 2: Configure Build Settings

1. **Project name**: `saveto`
2. **Production branch**: `main`
3. **Build command**: (leave empty or `npm run build`)
4. **Build output directory**: `public`
5. Click **"Save and Deploy"**

✅ Your static files are now deployed!

### Step 3: Add Environment Variables (Pages)

1. Click on your Pages project
2. Go to **Settings** → **Environment variables**
3. Add the same variables as in Part 6
4. Click **"Save"**

---

## Part 8: Configure Custom Domain (Optional)

### For Workers:

1. Go to your Worker → **Triggers** tab
2. Click **"Add Custom Domain"**
3. Enter your domain: `api.yourdomain.com`
4. Click **"Add Custom Domain"**

✅ SSL is automatically provisioned!

### For Pages:

1. Go to your Pages project → **Custom domains**
2. Click **"Set up a custom domain"**
3. Enter your domain: `yourdomain.com`
4. Click **"Continue"**
5. Follow DNS setup instructions

---

## Part 9: Monitor Your Deployment

### View Analytics

**Workers Analytics:**
1. Go to your Worker
2. Click **"Metrics"** tab
3. View requests, errors, CPU time

**Pages Analytics:**
1. Go to your Pages project
2. Click **"Analytics"** tab
3. View visitors, bandwidth, requests

### View Logs (Real-time)

**Workers Logs:**
1. Go to your Worker
2. Click **"Logs"** tab
3. Click **"Begin log stream"**

**Pages Logs:**
1. Go to your Pages project
2. Click **"Deployments"**
3. Click on a deployment
4. View build logs

---

## Part 10: Database Management (Web UI)

### Query Your Database

1. Go to **Workers & Pages** → **D1**
2. Click on `saveto-db`
3. Click **"Console"** tab
4. Enter SQL query:
   ```sql
   SELECT * FROM users LIMIT 10;
   ```
5. Click **"Execute"**

### View Tables

```sql
SELECT name FROM sqlite_master WHERE type='table';
```

### Check Table Schema

```sql
PRAGMA table_info(users);
```

---

## 🎯 Quick Reference: Dashboard URLs

| Resource | URL |
|----------|-----|
| Main Dashboard | https://dash.cloudflare.com/ |
| Workers & Pages | https://dash.cloudflare.com/workers |
| D1 Databases | https://dash.cloudflare.com/d1 |
| KV Storage | https://dash.cloudflare.com/kv |
| Analytics | https://dash.cloudflare.com/analytics |
| Account Settings | https://dash.cloudflare.com/profile |

---

## 📝 Checklist

Use this checklist as you set up through the UI:

**Database Setup:**
- [ ] Created `saveto-db` database
- [ ] Created `saveto-db-staging` database
- [ ] Created `saveto-db-production` database
- [ ] Ran migrations on all databases

**Storage Setup:**
- [ ] Created `CACHE` KV namespace
- [ ] Saved KV Namespace ID

**Worker Setup:**
- [ ] Created Worker
- [ ] Bound D1 database to Worker
- [ ] Bound KV namespace to Worker
- [ ] Added environment variables
- [ ] Deployed Worker code

**Pages Setup:**
- [ ] Connected GitHub repository
- [ ] Configured build settings
- [ ] First deployment successful
- [ ] Added environment variables

**Optional:**
- [ ] Configured custom domain for Worker
- [ ] Configured custom domain for Pages
- [ ] Set up analytics monitoring

---

## 🔧 Troubleshooting

### "Database binding not found"
- ✅ Check Worker Settings → Bindings
- ✅ Make sure variable name is exactly `DB`
- ✅ Re-deploy Worker after adding binding

### "KV namespace not accessible"
- ✅ Check Worker Settings → KV Namespace Bindings
- ✅ Make sure variable name is exactly `CACHE`
- ✅ Verify namespace is in the same account

### "Environment variable undefined"
- ✅ Check Worker Settings → Environment Variables
- ✅ Make sure variables are saved
- ✅ Re-deploy Worker after adding variables

### "Pages build failed"
- ✅ Check build logs in Pages → Deployments
- ✅ Verify build command is correct
- ✅ Check public directory exists

---

## 💡 Tips & Best Practices

### Development Workflow

1. **Test locally first:**
   ```bash
   wrangler dev
   ```

2. **Use staging environment:**
   - Create separate Worker: `saveto-staging`
   - Use separate D1: `saveto-db-staging`
   - Test changes before production

3. **Monitor regularly:**
   - Check Workers Metrics daily
   - Set up alerts for errors
   - Review Analytics weekly

### Security

1. **Rotate secrets regularly:**
   - Update `SECRET_KEY` every 90 days
   - Rotate GitHub OAuth tokens as needed

2. **Use encrypted variables:**
   - Always encrypt sensitive data
   - Never commit secrets to git

3. **Enable rate limiting:**
   - Configure in Worker settings
   - Protect against abuse

---

## 🚀 Next Steps

After setup through UI:

1. **Test your deployment:**
   - Visit your Worker URL
   - Test all features
   - Check database queries

2. **Set up monitoring:**
   - Enable email alerts
   - Configure Slack notifications
   - Set up uptime monitoring

3. **Optimize performance:**
   - Review Analytics
   - Optimize slow queries
   - Add caching where needed

4. **Plan for scaling:**
   - Monitor usage limits
   - Prepare for traffic growth
   - Consider paid plans if needed

---

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Dashboard Guide](https://developers.cloudflare.com/d1/get-started/)
- [Pages Dashboard](https://developers.cloudflare.com/pages/)
- [Video Tutorial](https://www.youtube.com/cloudflare) - Check Cloudflare's YouTube

---

## 🆘 Need Help?

- **Dashboard Help**: Click the **"?"** icon in any Cloudflare page
- **Community Forum**: https://community.cloudflare.com/
- **Support**: Use the chat icon in the dashboard
- **Documentation**: https://developers.cloudflare.com/

---

**Success!** 🎉

You've successfully set up Cloudflare Workers through the web UI!

Your app is now running globally on Cloudflare's edge network.
