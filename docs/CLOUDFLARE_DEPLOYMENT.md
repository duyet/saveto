# Cloudflare Deployment Guide

This guide explains how to deploy the Saveto project to Cloudflare Workers and Pages with D1 database.

## 🚀 Quick Start

### Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally
   ```bash
   npm install -g wrangler
   ```
3. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

### Automated Deployment

Use the deployment script for easy setup:

```bash
# Make the script executable
chmod +x deploy-cloudflare.sh

# Deploy to staging
./deploy-cloudflare.sh staging

# Deploy to production
./deploy-cloudflare.sh production

# Start local development
./deploy-cloudflare.sh dev
```

## 📋 Manual Deployment Steps

### 1. Create D1 Database

```bash
# Development database
npm run cf:d1:create

# This will output a database ID - copy it to wrangler.toml
```

Update `wrangler.toml` with your database ID:
```toml
[[d1_databases]]
binding = "DB"
database_name = "saveto-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace this
```

### 2. Run Database Migrations

```bash
# Development
npm run cf:d1:migrate

# Staging
npm run cf:d1:migrate:staging

# Production
npm run cf:d1:migrate:production
```

### 3. Create KV Namespace (Optional - for caching)

```bash
npm run cf:kv:create

# Copy the KV namespace ID to wrangler.toml
```

### 4. Deploy Workers

```bash
# Development (local)
npm run cf:dev

# Staging
npm run cf:deploy:staging

# Production
npm run cf:deploy:production
```

### 5. Deploy Static Assets to Pages

```bash
npm run cf:pages:deploy
```

## 🔧 Configuration

### Environment Variables

Set these in your Cloudflare dashboard or via CLI:

```bash
# Set secrets
wrangler secret put SECRET_KEY
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put GA_TRACKING_ID
```

Or create a `.dev.vars` file for local development (copy from `.dev.vars.example`):

```env
SECRET_KEY=your-secret-key
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Update wrangler.toml

Replace placeholder IDs in `wrangler.toml`:

1. **Account ID**: Find at https://dash.cloudflare.com/
2. **D1 Database IDs**: Created via `wrangler d1 create`
3. **KV Namespace IDs**: Created via `wrangler kv:namespace create`

## 🤖 GitHub Actions CI/CD

The project includes automated deployment via GitHub Actions.

### Setup Secrets

Add these secrets to your GitHub repository:
- Settings → Secrets and variables → Actions → New repository secret

Required secrets:
1. `CLOUDFLARE_API_TOKEN`: Create at https://dash.cloudflare.com/profile/api-tokens
   - Use "Edit Cloudflare Workers" template
   - Include D1, Pages, and Workers permissions

2. `CLOUDFLARE_ACCOUNT_ID`: Find at https://dash.cloudflare.com/

### Workflow Triggers

- **Push to `staging` branch**: Auto-deploys to staging
- **Push to `main` branch**: Auto-deploys to production
- **Manual dispatch**: Deploy on-demand from Actions tab

### Environments

The workflow uses GitHub Environments for protection:
- **staging**: No protection rules
- **production**: Require approval from maintainers

Set up in: Settings → Environments → New environment

## 🗄️ Database Management

### Query Database

```bash
# Interactive shell
wrangler d1 execute saveto-db --command "SELECT * FROM users LIMIT 10"

# From file
wrangler d1 execute saveto-db --file=./query.sql
```

### Backup Database

```bash
# Export to SQL
wrangler d1 export saveto-db > backup.sql

# Import from SQL
wrangler d1 execute saveto-db --file=./backup.sql
```

### Database Schema

The schema is defined in `schema.sql` and includes:
- **sessions**: Session storage (replaces Redis)
- **users**: User accounts
- **urls**: Saved links/bookmarks
- **tags**: Link tags
- **notes**: Code snippets
- **til**: Today I Learned posts
- **applications**: API keys
- **activity_logs**: Audit trail

## 📊 Monitoring

### View Logs

```bash
# Tail production logs
wrangler tail

# Tail with filter
wrangler tail --env production --format pretty
```

### Analytics

View in Cloudflare Dashboard:
- Workers Analytics: https://dash.cloudflare.com/workers
- Pages Analytics: https://dash.cloudflare.com/pages
- D1 Analytics: https://dash.cloudflare.com/d1

## 🔍 Debugging

### Local Development

```bash
# Start local Workers dev server
npm run cf:dev

# Access at http://localhost:8787
```

### Remote Debugging

```bash
# View Workers logs in real-time
wrangler tail --env production

# Check deployment status
wrangler deployments list
```

## 🌐 Custom Domain

### Setup Custom Domain

1. Go to Workers & Pages → your-worker → Triggers
2. Add custom domain: `saveto.yourdomain.com`
3. Cloudflare will automatically provision SSL

### DNS Configuration

If using external DNS:
```
CNAME  saveto  your-worker.workers.dev
```

## 🚨 Rollback

### Rollback Workers Deployment

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]
```

### Rollback Database

```bash
# Restore from backup
wrangler d1 execute saveto-db --file=./backup.sql
```

## 📈 Scaling & Performance

### D1 Limits (as of 2024)
- **Storage**: 500 MB (free tier)
- **Queries**: 5M reads/day, 100K writes/day
- **Response time**: ~20-40ms

### Workers Limits
- **CPU time**: 50ms per request (free), 50ms (paid)
- **Memory**: 128 MB
- **Requests**: 100K/day (free), unlimited (paid)

### Optimization Tips
1. Use KV for read-heavy caching
2. Batch D1 queries when possible
3. Enable Cloudflare CDN for static assets
4. Use Durable Objects for real-time features

## 🔐 Security

### Best Practices
1. Never commit `.dev.vars` or secrets
2. Use Cloudflare Access for admin pages
3. Enable rate limiting in wrangler.toml
4. Rotate API keys regularly
5. Use prepared statements for D1 queries

### Rate Limiting

Already configured in `wrangler.toml`:
```toml
[[unsafe.bindings]]
name = "RATE_LIMITER"
type = "ratelimit"
namespace_id = "1001"
simple = { limit = 100, period = 60 }
```

## 💰 Cost Estimation

### Free Tier Includes
- Workers: 100K requests/day
- D1: 500 MB storage, 5M reads/day
- Pages: Unlimited requests
- KV: 100K reads/day

### Paid Plans (if exceeded)
- Workers: $5/10M requests
- D1: $5/GB storage, $1/M reads
- Pages: Free (always)

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## 🆘 Troubleshooting

### Common Issues

**Error: "Database not found"**
```bash
# Make sure database is created
wrangler d1 list

# If missing, create it
npm run cf:d1:create
```

**Error: "Invalid API token"**
```bash
# Re-login
wrangler logout
wrangler login
```

**Error: "Module not found"**
```bash
# Install dependencies
npm install

# Clear cache
rm -rf node_modules .wrangler
npm install
```

## 🎯 Next Steps

After deployment:
1. ✅ Test all features on staging
2. ✅ Configure custom domain
3. ✅ Set up monitoring and alerts
4. ✅ Enable Cloudflare CDN
5. ✅ Configure WAF rules
6. ✅ Set up automated backups
7. ✅ Performance testing with Lighthouse

---

**Need help?** Open an issue or check the [Cloudflare Community](https://community.cloudflare.com/)
