#!/bin/bash

# Cloudflare Deployment Script for Saveto
# Usage: ./deploy-cloudflare.sh [environment]
# Environment: dev, staging, production (default: staging)

set -e  # Exit on error

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Saveto Cloudflare Deployment Tool  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI not found!"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

print_success "Wrangler CLI found"

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    print_warning "Not logged in to Cloudflare"
    print_info "Running: wrangler login"
    wrangler login
fi

print_success "Logged in to Cloudflare"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    echo "Valid environments: dev, staging, production"
    exit 1
fi

print_info "Deploying to: ${ENVIRONMENT}"

# Step 1: Create D1 database if it doesn't exist
print_info "Step 1: Checking D1 database..."

DB_NAME="saveto-db"

print_info "Database name: ${DB_NAME}"

# Check if database exists
DB_EXISTS=$(wrangler d1 list | grep -c "$DB_NAME" || true)

if [ "$DB_EXISTS" -eq 0 ]; then
    print_warning "Database $DB_NAME doesn't exist. Creating..."
    DB_ID=$(wrangler d1 create "$DB_NAME" | grep "database_id" | awk '{print $3}' | tr -d '"')
    print_success "Database created with ID: $DB_ID"
    print_warning "Please update wrangler.toml with this database ID"

    # Prompt to update wrangler.toml
    read -p "Press Enter to continue after updating wrangler.toml..."
else
    print_success "Database $DB_NAME already exists"
fi

# Step 2: Run database migrations
print_info "Step 2: Running database migrations..."

if [ -f "schema.sql" ]; then
    if [ "$ENVIRONMENT" = "production" ]; then
        read -p "⚠️  Run migrations on PRODUCTION? (yes/no): " CONFIRM
        if [ "$CONFIRM" != "yes" ]; then
            print_warning "Skipping production migrations"
        else
            wrangler d1 execute "$DB_NAME" --file=./schema.sql
            print_success "Production migrations completed"
        fi
    else
        wrangler d1 execute "$DB_NAME" --file=./schema.sql
        print_success "Migrations completed"
    fi
else
    print_warning "No schema.sql found, skipping migrations"
fi

# Step 3: Create KV namespace for cache if needed
print_info "Step 3: Checking KV namespace..."

KV_NAME="CACHE"
KV_EXISTS=$(wrangler kv:namespace list | grep -c "$KV_NAME" || true)

if [ "$KV_EXISTS" -eq 0 ]; then
    print_warning "KV namespace doesn't exist. Creating..."
    KV_ID=$(wrangler kv:namespace create "$KV_NAME" | grep "id" | awk '{print $3}' | tr -d '"')
    print_success "KV namespace created with ID: $KV_ID"
    print_warning "Please update wrangler.toml with this KV ID"
else
    print_success "KV namespace already exists"
fi

# Step 4: Deploy Workers
print_info "Step 4: Deploying to Cloudflare Workers..."

if [ "$ENVIRONMENT" = "dev" ]; then
    print_info "Starting development server..."
    wrangler dev
elif [ "$ENVIRONMENT" = "production" ]; then
    read -p "⚠️  Deploy to PRODUCTION? (yes/no): " CONFIRM
    if [ "$CONFIRM" = "yes" ]; then
        wrangler deploy --env production
        print_success "Deployed to production!"
    else
        print_warning "Production deployment cancelled"
        exit 0
    fi
fi

# Step 5: Deploy static assets to Pages
print_info "Step 5: Deploying static assets to Cloudflare Pages..."

if [ -d "public" ]; then
    if [ "$ENVIRONMENT" = "production" ]; then
        wrangler pages deploy ./public --project-name saveto --branch main
    else
        wrangler pages deploy ./public --project-name saveto --branch "$ENVIRONMENT"
    fi
    print_success "Static assets deployed to Pages"
else
    print_warning "No public directory found, skipping Pages deployment"
fi

# Step 6: Display deployment information
echo ""
echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Deployment Completed! 🚀       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
echo ""

print_info "Environment: $ENVIRONMENT"
print_info "Database: $DB_NAME"

# Get actual deployed URLs from wrangler
WORKER_NAME="saveto"
if [ "$ENVIRONMENT" != "dev" ]; then
    if [ "$ENVIRONMENT" = "production" ]; then
        WORKER_NAME="saveto-production"
    fi

    print_info "Fetching deployment URLs..."
    WORKER_URL=$(wrangler deployments list --env "$ENVIRONMENT" 2>/dev/null | grep -o 'https://.*workers.dev' | head -1 || echo "Check Cloudflare Dashboard")

    if [ -n "$WORKER_URL" ] && [ "$WORKER_URL" != "Check Cloudflare Dashboard" ]; then
        print_info "Workers URL: $WORKER_URL"
    else
        print_warning "Workers URL: Check your Cloudflare Dashboard"
    fi

    print_info "Pages URL: Check https://dash.cloudflare.com/pages"
fi

echo ""
print_success "Next steps:"
echo "  1. Test your deployment"
echo "  2. Configure custom domain (if needed)"
echo "  3. Set up environment variables in Cloudflare dashboard"
echo "  4. Monitor logs: wrangler tail"
echo ""
