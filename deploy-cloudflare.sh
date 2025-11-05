#!/bin/bash

# Cloudflare Deployment Script for Saveto
# Usage: ./deploy-cloudflare.sh [command]
# Commands: dev, deploy

set -e  # Exit on error

COMMAND=${1:-deploy}

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

# Validate command
if [[ ! "$COMMAND" =~ ^(dev|deploy)$ ]]; then
    print_error "Invalid command: $COMMAND"
    echo ""
    echo "Usage:"
    echo "  ./deploy-cloudflare.sh dev     - Start local development (Node.js or Workers)"
    echo "  ./deploy-cloudflare.sh deploy  - Deploy to Cloudflare Workers"
    echo ""
    exit 1
fi

# Handle dev command
if [ "$COMMAND" = "dev" ]; then
    echo ""
    print_info "🚀 Starting development server..."
    echo ""

    # Check if user wants Workers dev or regular dev
    echo "Choose development mode:"
    echo "  1) Local Node.js server (http://localhost:6969)"
    echo "  2) Cloudflare Workers dev (http://localhost:8787)"
    read -p "Enter choice (1 or 2): " DEV_CHOICE

    if [ "$DEV_CHOICE" = "2" ]; then
        print_info "Starting Cloudflare Workers development server..."
        print_warning "Make sure you've run migrations: wrangler d1 execute saveto --file=./schema.sql"
        wrangler dev
    else
        print_info "Starting Node.js/Koa backend..."
        print_info "The app will run on http://localhost:6969"

        if [ ! -f "app.js" ]; then
            print_error "app.js not found. Cannot start dev server."
            exit 1
        fi

        npm start
    fi

    exit 0
fi

# Handle deploy command (Workers)
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

echo ""
print_info "🚀 Deploying to Cloudflare Workers..."
echo ""

# Check if worker entry point exists
if [ ! -f "src/worker.js" ]; then
    print_error "Worker entry point not found at src/worker.js"
    echo "Please review WORKERS_MIGRATION_GUIDE.md for setup instructions"
    exit 1
fi

# Remind about migrations
print_warning "Pre-deployment checklist:"
echo "  1. Have you run database migrations?"
echo "     wrangler d1 execute saveto --file=./schema.sql"
echo "  2. Have you updated app.js to export the app?"
echo "  3. Have you replaced MongoDB with D1 adapter?"
echo ""
read -p "Continue with deployment? (yes/no): " DEPLOY_CONFIRM

if [ "$DEPLOY_CONFIRM" != "yes" ]; then
    print_warning "Deployment cancelled"
    exit 0
fi

# Deploy to Workers
print_info "Deploying Workers..."
wrangler deploy

# Display success message
echo ""
echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Completed! 🚀         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
echo ""

print_success "Koa.js app deployed to Cloudflare Workers!"
echo ""
print_info "📊 View your deployment:"
print_info "   Dashboard: https://dash.cloudflare.com/workers"
print_info "   Logs: wrangler tail"
echo ""
print_success "Next steps:"
echo "  1. Test your Worker URL"
echo "  2. Monitor logs with: wrangler tail"
echo "  3. Configure custom domain (optional)"
echo "  4. Review WORKERS_MIGRATION_GUIDE.md for optimization tips"
echo ""
