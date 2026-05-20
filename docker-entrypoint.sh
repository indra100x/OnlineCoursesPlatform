#!/bin/sh
set -e

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:..." ] || ! php -r '
    $key = getenv("APP_KEY");
    if (! is_string($key) || $key === "") {
        exit(1);
    }

    if (str_starts_with($key, "base64:")) {
        $decoded = base64_decode(substr($key, 7), true);
        exit($decoded !== false && strlen($decoded) === 32 ? 0 : 1);
    }

    exit(strlen($key) === 32 ? 0 : 1);
' 2>/dev/null; then
    echo "ERROR: APP_KEY is not set or invalid."
    echo "Generate one with: php artisan key:generate"
    exit 1
fi

echo "Running in $APP_ENV environment"

# A named Docker volume mounted at /var/www/html/public starts empty and hides
# the image's baked-in frontend files. Re-seed it on first boot.
if [ -d "/opt/app-public" ] && { [ ! -f "public/index.php" ] || [ ! -f "public/build/manifest.json" ]; }; then
    echo "Seeding public volume from image..."
    mkdir -p public
    cp -a /opt/app-public/. public/
fi

# Keep the runtime public volume aligned with the image's baked frontend
# assets after rebuilds so Docker doesn't keep serving a stale manifest.
if [ -d "/opt/app-public/build" ]; then
    mkdir -p public/build
    cp -a /opt/app-public/build/. public/build/
fi

# Prevent Laravel's Vite integration from treating the container like a local
# dev server when a stale host-generated hot file exists.
rm -f public/hot

# Wait for database to be ready
echo "Waiting for database at $DB_HOST:$DB_PORT..."
for i in $(seq 1 30); do
    if [ "$DB_CONNECTION" = "pgsql" ]; then
        if php -r "new PDO('pgsql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_DATABASE;sslmode=require', '$DB_USERNAME', '$DB_PASSWORD');" 2>/dev/null; then
            echo "Database is ready!"
            break
        fi
    else
        if php -r "new PDO('mysql:host=$DB_HOST;port=$DB_PORT', '$DB_USERNAME', '$DB_PASSWORD');" 2>/dev/null; then
            echo "Database is ready!"
            break
        fi
    fi
    echo "Attempt $i/30: Database not ready yet..."
    sleep 1
done

# Ensure all required directories exist
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/testing
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p resources/views
mkdir -p bootstrap/cache

# Drop any stale host-generated Laravel caches before Artisan boots.
rm -f bootstrap/cache/config.php
rm -f bootstrap/cache/routes-v7.php
rm -f bootstrap/cache/packages.php
rm -f bootstrap/cache/services.php
rm -f bootstrap/cache/events.php

# Fix storage permissions
chown -R 1000:1000 storage bootstrap/cache resources/views 2>/dev/null || true
chmod -R 775 storage bootstrap/cache resources/views 2>/dev/null || true

# Make sure runtime temp writes for compiled views work even on fresh volumes.
touch storage/framework/views/.write-test 2>/dev/null || true
rm -f storage/framework/views/.write-test 2>/dev/null || true

php artisan config:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true

if [ ! -f "vendor/autoload.php" ]; then
    composer_opts="--no-interaction --no-progress"
    if [ "$APP_ENV" != "local" ] && [ "$APP_ENV" != "testing" ]; then
        composer_opts="$composer_opts --no-dev"
    fi
    composer install $composer_opts
fi

php artisan storage:link --force 2>/dev/null || true

# Skip auto-migrations on startup - run manually via: docker exec web-project-app php artisan migrate:fresh --seed
# php artisan migrate --force 2>/dev/null || true
# php artisan db:seed --force 2>/dev/null || true

exec "$@"
