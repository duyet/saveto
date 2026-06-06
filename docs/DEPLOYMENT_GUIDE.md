# 📖 Step-by-Step Cloudflare Deployment Guide

This guide will walk you through deploying Saveto to Cloudflare from scratch. No prior Cloudflare experience required!

---

## 🎯 What You'll Deploy

- **Cloudflare Workers**: API and backend logic
- **Cloudflare Pages**: Static frontend assets
- **Cloudflare D1**: SQL database (replaces MongoDB + Redis)

---

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- [ ] A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works!)
- [ ] [Node.js 20+](https://nodejs.org/) installed
- [ ] [Git](https://git-scm.com/) installed
- [ ] Terminal/Command line access
- [ ] This repository cloned locally

---

## 🚀 Part 1: Local Setup (5 minutes)

### Step 1.1: Install Wrangler CLI

```bash
# Install Wrangler globally
npm install -g wrangler@latest

# Verify installation
wrangler --version
```

**Expected output**: `wrangler 3.x.x` (or higher)

### Step 1.2: Login to Cloudflare

```bash
# This will open your browser
wrangler login
```

✅ Click "Allow" in your browser to grant access

### Step 1.3: Get Your Account ID

```bash
# This shows your account details
wrangler whoami
```

📝 **Copy your Account ID** - you'll need it in Step 2.3

---

## 🗄️ Part 2: Database Setup (10 minutes)

### Step 2.1: Create D1 Databases

Create three databases (dev, staging, production):

```bash
# Development database
wrangler d1 create saveto-db

# Staging database
wrangler d1 create saveto-db-staging

# Production database
wrangler d1 create saveto-db-production
```

After each command, you'll see output like:
```
✅ Successfully created DB 'saveto-db'!

[[d1_databases]]
binding = "DB"
database_name = "saveto-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

📝 **Save all three database IDs** - you'll need them in the next step!

### Step 2.2: Create KV Namespace (Optional - for caching)

```bash
# Create cache namespace
wrangler kv:namespace create CACHE

# Create preview namespace for testing
wrangler kv:namespace create CACHE --preview
```

📝 **Save the KV namespace IDs** from the output

### Step 2.3: Update wrangler.toml

Open `wrangler.toml` in your editor and replace the placeholder values:

```toml
# Line 11: Add your Account ID
account_id = "YOUR_ACCOUNT_ID"  # Replace with your Account ID from Step 1.3

# Line 21: Add your dev database ID
database_id = "YOUR_D1_DATABASE_ID"  # From Step 2.1 (saveto-db)

# Line 26: Add your KV cache ID
id = "YOUR_KV_CACHE_ID"  # From Step 2.2
preview_id = "YOUR_KV_CACHE_PREVIEW_ID"  # From Step 2.2

# Line 37: Add your production database ID
database_id = "YOUR_PROD_D1_DATABASE_ID"  # From Step 2.1 (saveto-db-production)

# Line 40: Add your production KV ID
id = "YOUR_PROD_KV_CACHE_ID"  # Same as line 26 or create a separate one

# Line 50: Add your staging database ID
database_id = "YOUR_STAGING_D1_DATABASE_ID"  # From Step 2.1 (saveto-db-staging)

# Line 53: Add your staging KV ID
id = "YOUR_STAGING_KV_CACHE_ID"  # Same or separate KV namespace
```

✅ **Save the file** after making changes

### Step 2.4: Run Database Migrations

```bash
# Run migrations for all environments

# Development
npm run cf:d1:migrate

# Staging
npm run cf:d1:migrate:staging

# Production
npm run cf:d1:migrate:production
```

✅ You should see: "Executing on saveto-db... 🌀 Executing on remote database..."

---

## 🔐 Part 3: Environment Variables (5 minutes)

### Step 3.1: Create Local Development File

```bash
# Copy the example file
cp .dev.vars.example .dev.vars
```

### Step 3.2: Edit .dev.vars

Open `.dev.vars` and fill in your values:

```env
SECRET_KEY=your-random-secret-key-here
SESSION_SECRET=another-random-secret-here
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
GA_TRACKING_ID=your-google-analytics-id
```

💡 **Tips:**
- Generate random secrets: `openssl rand -base64 32`
- Get GitHub OAuth keys: https://github.com/settings/developers
- Skip GA_TRACKING_ID if you don't have Google Analytics

### Step 3.3: Set Production Secrets

```bash
# Set secrets for production (will prompt for each value)
wrangler secret put SECRET_KEY --env production
wrangler secret put SESSION_SECRET --env production
wrangler secret put GITHUB_CLIENT_ID --env production
wrangler secret put GITHUB_CLIENT_SECRET --env production

# Set for staging too
wrangler secret put SECRET_KEY --env staging
wrangler secret put SESSION_SECRET --env staging
wrangler secret put GITHUB_CLIENT_ID --env staging
wrangler secret put GITHUB_CLIENT_SECRET --env staging
```

---

## 🧪 Part 4: Test Local Development (5 minutes)

### Step 4.1: Install Dependencies

```bash
npm install
```

### Step 4.2: Start Development Server

```bash
# Option 1: Use npm script
npm run cf:dev

# Option 2: Use wrangler directly
wrangler dev
```

### Step 4.3: Test Your Local Site

Open your browser to: **http://localhost:8787**

✅ You should see the Saveto homepage!

🔍 **Test these features:**
- [ ] Homepage loads
- [ ] Can view links
- [ ] Can create a link (may need login)
- [ ] Database queries work

Press `Ctrl+C` to stop the dev server when done testing.

---

## 🌐 Part 5: Deploy to Staging (5 minutes)

### Step 5.1: Use the Automated Script

```bash
# Make script executable (first time only)
chmod +x deploy-cloudflare.sh

# Deploy to staging
./deploy-cloudflare.sh staging
```

The script will:
1. ✅ Check your Cloudflare login
2. ✅ Verify database exists
3. ✅ Run migrations automatically
4. ✅ Deploy Workers
5. ✅ Deploy static assets to Pages

### Step 5.2: Get Your Staging URL

After deployment, the script shows:
```
✓ Workers URL: https://saveto-staging.<your-account>.workers.dev
```

🌐 **Open that URL in your browser** to test staging!

---

## 🚀 Part 6: Deploy to Production (5 minutes)

### Step 6.1: Deploy with Script

```bash
# Deploy to production (will ask for confirmation)
./deploy-cloudflare.sh production
```

Type `yes` when prompted.

### Step 6.2: Verify Production

After deployment completes:

1. Open your production URL (shown in output)
2. Test all critical features:
   - [ ] Homepage loads
   - [ ] User can register/login
   - [ ] Can save links
   - [ ] Can create notes
   - [ ] Tags work

---

## 🤖 Part 7: Setup Automatic Deployments (10 minutes)

Enable GitHub Actions to auto-deploy when you push code.

### Step 7.1: Get Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"**
4. Click **"Continue to summary"**
5. Click **"Create Token"**
6. 📝 **Copy the token** (you won't see it again!)

### Step 7.2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these two secrets:

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: (paste the token from Step 7.1)

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: (your Account ID from Part 1, Step 1.3)

### Step 7.3: Create GitHub Environments

1. Go to **Settings** → **Environments**
2. Create two environments:

**Environment 1: staging**
- Click **"New environment"**
- Name: `staging`
- No protection rules needed
- Click **"Configure environment"**

**Environment 2: production**
- Click **"New environment"**
- Name: `production`
- ✅ Enable **"Required reviewers"**
- Add yourself as a reviewer
- Click **"Save protection rules"**

### Step 7.4: Test Automatic Deployment

```bash
# Make a small change
echo "# Test deployment" >> README.md

# Commit and push to staging branch
git checkout -b staging
git add README.md
git commit -m "test: trigger staging deployment"
git push origin staging
```

🎯 **Check GitHub Actions:**
1. Go to your repo → **Actions** tab
2. You should see a workflow running!
3. It will auto-deploy to staging

**To deploy to production:**
```bash
git checkout main
git merge staging
git push origin main
```

The workflow will ask for approval (if you set up protection rules).

---

## 📊 Part 8: Monitor Your Deployment

### View Logs

```bash
# Tail production logs in real-time
wrangler tail --env production

# Filter for errors only
wrangler tail --env production --format pretty | grep ERROR
```

### View Analytics

**Cloudflare Dashboard:**
- Workers Analytics: https://dash.cloudflare.com/workers
- Pages Analytics: https://dash.cloudflare.com/pages
- D1 Database: https://dash.cloudflare.com/d1

### Check Database

```bash
# Query your database
wrangler d1 execute saveto-db --env production --command "SELECT COUNT(*) FROM users"

# See all tables
wrangler d1 execute saveto-db --env production --command "SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 🎨 Part 9: Custom Domain (Optional, 5 minutes)

### Step 9.1: Add Custom Domain to Workers

1. Go to: https://dash.cloudflare.com/workers
2. Click your worker → **Triggers** tab
3. Click **"Add Custom Domain"**
4. Enter: `api.yourdomain.com`
5. Click **"Add Custom Domain"**

✅ SSL is automatic!

### Step 9.2: Add Custom Domain to Pages

1. Go to: https://dash.cloudflare.com/pages
2. Click your project → **Custom domains**
3. Click **"Set up a custom domain"**
4. Enter: `yourdomain.com`
5. Click **"Continue"**

Cloudflare will update DNS automatically if your domain is on Cloudflare.

---

## 🔧 Troubleshooting

### Error: "Database not found"

```bash
# List all databases
wrangler d1 list

# If missing, create it
wrangler d1 create saveto-db

# Update wrangler.toml with the new database_id
```

### Error: "Invalid API token"

```bash
# Logout and login again
wrangler logout
wrangler login
```

### Error: "Account ID mismatch"

1. Run: `wrangler whoami`
2. Copy the correct Account ID
3. Update `wrangler.toml` line 11

### Deployment Stuck

```bash
# Cancel and retry
Ctrl+C

# Clear cache
rm -rf node_modules/.wrangler

# Try again
npm run cf:deploy:staging
```

### GitHub Actions Failing

1. Check **Actions** tab for error messages
2. Verify secrets are set correctly:
   - Settings → Secrets and variables → Actions
3. Make sure environment names match exactly:
   - `staging` and `production` (lowercase)

---

## 📝 Quick Reference Commands

```bash
# Local Development
npm run cf:dev                          # Start local dev server

# Database
npm run cf:d1:migrate                   # Run migrations (dev)
npm run cf:d1:migrate:staging          # Run migrations (staging)
npm run cf:d1:migrate:production       # Run migrations (production)

# Manual Deployment
./deploy-cloudflare.sh dev             # Local dev
./deploy-cloudflare.sh staging         # Deploy to staging
./deploy-cloudflare.sh production      # Deploy to production

# Monitoring
wrangler tail                          # View live logs
wrangler deployments list              # List all deployments
wrangler d1 execute saveto-db --command "SQL" # Query database

# Rollback
wrangler deployments list              # Get deployment ID
wrangler rollback [deployment-id]      # Rollback to specific version
```

---

## ✅ Deployment Checklist

Print this checklist and check off each item as you complete it:

**Initial Setup:**
- [ ] Installed Wrangler CLI
- [ ] Logged in to Cloudflare
- [ ] Got Account ID
- [ ] Created D1 databases (dev, staging, production)
- [ ] Created KV namespace
- [ ] Updated wrangler.toml with all IDs
- [ ] Ran database migrations

**Environment Variables:**
- [ ] Created .dev.vars file
- [ ] Set production secrets
- [ ] Set staging secrets

**Testing:**
- [ ] Tested local development
- [ ] Deployed to staging
- [ ] Tested staging deployment
- [ ] Deployed to production
- [ ] Tested production deployment

**CI/CD:**
- [ ] Created Cloudflare API token
- [ ] Added secrets to GitHub
- [ ] Created GitHub environments
- [ ] Tested automatic deployment

**Optional:**
- [ ] Added custom domain
- [ ] Set up monitoring/alerts
- [ ] Configured Cloudflare CDN

---

## 🎉 Success!

Congratulations! Your Saveto app is now running on Cloudflare!

**What's Next?**

1. 📊 Monitor your usage in Cloudflare Dashboard
2. 🔒 Review security settings
3. 🚀 Enable Cloudflare CDN for better performance
4. 📈 Set up analytics and monitoring
5. 🧪 Write tests for critical features

---

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Guide](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Community](https://community.cloudflare.com/)

---

## 🆘 Need Help?

- **GitHub Issues**: Open an issue in this repository
- **Cloudflare Community**: https://community.cloudflare.com/
- **Discord**: Join the Cloudflare Developers Discord
- **Email**: support@cloudflare.com (for account issues)

---

**Happy Deploying! 🚀**
