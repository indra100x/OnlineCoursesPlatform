#!/bin/bash

set -e

echo "Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    log_error "Not in Laravel root directory"
    exit 1
fi

# Pull latest changes
log_info "Pulling latest changes..."
git pull origin main

# Install PHP dependencies
log_info "Installing Composer dependencies..."
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# Install Node dependencies and build
log_info "Installing npm dependencies..."
npm ci --production=false

log_info "Building frontend assets..."
npm run build

# Run migrations
log_info "Running database migrations..."
php artisan migrate --force

# Cache configurations
log_info "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Clear old caches
php artisan cache:prune-stale-tags

# Queue restart
log_info "Restarting queue workers..."
php artisan queue:restart

# Reload PHP-FPM (if using nginx + php-fpm)
if command -v sudo &> /dev/null; then
    sudo systemctl reload php-fpm || sudo service php-fpm reload || true
fi

log_info "Deployment completed successfully!"
