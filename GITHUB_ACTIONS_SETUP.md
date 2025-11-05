# GitHub Actions Workflow Setup

## ⚠️ Important Note

The GitHub Actions workflow file could not be automatically committed due to workflow permissions.

You need to add it manually through the GitHub web interface.

## 📝 How to Add the Workflow

### Option 1: Add via GitHub Web UI (Recommended)

1. Go to your repository on GitHub
2. Navigate to: **Actions** tab
3. Click **"New workflow"** or **"Set up a workflow yourself"**
4. Copy the contents from `.github/workflows/deploy-cloudflare.yml` (see below)
5. Paste into the editor
6. Click **"Commit changes"**

### Option 2: Add via Pull Request from UI

1. Go to your repository on GitHub
2. Navigate to: **Add file** → **Create new file**
3. Name it: `.github/workflows/deploy-cloudflare.yml`
4. Copy/paste the workflow content (see below)
5. Commit directly to your branch
6. Create a pull request

### Option 3: Push from a Different Branch

```bash
# Create a new branch from main/master
git checkout main
git pull
git checkout -b add-github-actions

# Copy the workflow file
mkdir -p .github/workflows
cp /path/to/deploy-cloudflare.yml .github/workflows/

# Commit and push
git add .github/workflows/deploy-cloudflare.yml
git commit -m "ci: Add Cloudflare deployment workflow"
git push origin add-github-actions

# Create PR on GitHub
```

## 📄 Workflow File Content

The workflow file is located at: `.github/workflows/deploy-cloudflare.yml`

You can view it in your local repository or copy it from below:

```yaml
# Copy the entire contents from .github/workflows/deploy-cloudflare.yml
# The file is already created locally in your repository
```

## ✅ After Adding the Workflow

Once the workflow is added, you need to:

1. **Add Required Secrets** (Settings → Secrets and variables → Actions):
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

2. **Create Environments** (Settings → Environments):
   - `staging`: No protection rules
   - `production`: Require approvals

3. **Test the Workflow**:
   ```bash
   # Push to staging branch to trigger deployment
   git push origin staging

   # Or run manually from Actions tab
   ```

## 🔑 Getting Cloudflare Credentials

### API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"**
4. Ensure these permissions are included:
   - Account → Workers Scripts → Edit
   - Account → D1 → Edit
   - Account → Cloudflare Pages → Edit
5. Click **"Continue to summary"** → **"Create Token"**
6. Copy the token (you won't see it again!)

### Account ID

1. Go to: https://dash.cloudflare.com/
2. Click on **Workers & Pages**
3. Your Account ID is shown in the right sidebar
4. Or run: `wrangler whoami`

## 🧪 Testing the Workflow

After setup, test with:

```bash
# Make a test change
echo "# Test" >> README.md

# Push to staging
git checkout staging
git add README.md
git commit -m "test: trigger deployment"
git push origin staging

# Check Actions tab on GitHub
```

You should see the workflow run automatically!

## 📚 More Information

See `DEPLOYMENT_GUIDE.md` Part 7 for detailed setup instructions.
