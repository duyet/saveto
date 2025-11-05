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
    echo "  ./deploy-cloudflare.sh dev     - Start local development server"
    echo "  ./deploy-cloudflare.sh deploy  - Deploy static assets to Cloudflare Pages"
    echo ""
    exit 1
fi

# Handle dev command
if [ "$COMMAND" = "dev" ]; then
    echo ""
    print_info "🚀 Starting local development server..."
    echo ""
    print_warning "Note: This starts the Node.js/Koa backend"
    print_info "The app will run on http://localhost:6969"
    echo ""

    # Check if we have the start script
    if [ ! -f "app.js" ]; then
        print_error "app.js not found. Cannot start dev server."
        exit 1
    fi

    # Start the development server
    npm start
    exit 0
fi

# Handle deploy command (Pages only)
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
print_info "📦 Deploying static assets to Cloudflare Pages..."
echo ""

# Check if public directory exists
if [ ! -d "public" ]; then
    print_error "No public directory found!"
    echo "The public/ directory should contain your static assets (CSS, JS, images)"
    exit 1
fi

print_info "Contents of public/ directory:"
ls -lh public/ | head -10

echo ""
print_info "Deploying to Cloudflare Pages..."

# Deploy to Pages
wrangler pages deploy ./public --project-name saveto --branch main

# Display success message
echo ""
echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Completed! 🚀         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
echo ""

print_success "Static assets deployed successfully!"
echo ""
print_info "📱 Check your deployment:"
print_info "   Dashboard: https://dash.cloudflare.com/pages"
echo ""
print_warning "⚠️  Note about Workers:"
echo "   This project uses Koa.js which requires Node.js runtime"
echo "   Workers deployment is not available (Workers use V8 isolates)"
echo "   Keep your backend (app.js) running on your existing hosting"
echo ""
print_success "Next steps:"
echo "  1. Visit your Pages URL to verify deployment"
echo "  2. Configure custom domain (optional)"
echo "  3. Your backend continues serving API requests"
echo ""
