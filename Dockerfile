FROM php:8.4-fpm-alpine AS base

RUN apk add --no-cache \
    curl \
    git \
    unzip \
    libzip-dev \
    oniguruma-dev \
    libpq-dev \
    libpng-dev \
    php84-curl \
    && docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql \
    mbstring \
    zip \
    bcmath \
    gd \
    && rm -rf /var/cache/apk/* \
    && addgroup -g 1000 laravel \
    && adduser -D -u 1000 -G laravel laravel

RUN sed -i 's/^user = www-data/user = laravel/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^group = www-data/group = laravel/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^listen.owner = www-data/listen.owner = laravel/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/^listen.group = www-data/listen.group = laravel/' /usr/local/etc/php-fpm.d/www.conf

COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader --no-scripts

COPY . .

COPY config/view.php ./config/view.php

RUN rm -f bootstrap/cache/config.php \
    && rm -f bootstrap/cache/routes-v7.php \
    && rm -f bootstrap/cache/packages.php \
    && rm -f bootstrap/cache/services.php \
    && rm -f bootstrap/cache/events.php

RUN composer run post-autoload-dump 2>/dev/null || true; \
    php artisan optimize:clear 2>/dev/null || true

RUN mkdir -p storage/framework/cache/data \
    && mkdir -p storage/framework/sessions \
    && mkdir -p storage/framework/testing \
    && mkdir -p storage/framework/views \
    && mkdir -p storage/logs \
    && mkdir -p resources/views \
    && mkdir -p bootstrap/cache \
    && chown -R 1000:1000 storage bootstrap/cache resources/views 2>/dev/null || true

FROM node:22-alpine AS node-build

RUN apk add --no-cache \
    build-base \
    python3 \
    php84 \
    php84-cli \
    php84-common \
    php84-curl \
    php84-mbstring \
    php84-pdo \
    php84-pdo_mysql \
    php84-pgsql \
    php84-tokenizer \
    php84-xml \
    php84-xmlwriter \
    php84-simplexml \
    php84-fileinfo \
    php84-openssl \
    php84-phar \
    php84-dom \
    php84-json \
    php84-ctype \
    php84-session \
    php84-iconv \
    && ln -s /usr/bin/php84 /usr/bin/php

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader --no-scripts

COPY package.json package-lock.json ./
RUN npm config set fetch-timeout 60000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm_config_ignore_scripts=true npm ci --prefer-offline --no-audit

RUN apk del build-base python3

COPY . .

RUN rm -f bootstrap/cache/config.php \
    && rm -f bootstrap/cache/routes-v7.php \
    && rm -f bootstrap/cache/packages.php \
    && rm -f bootstrap/cache/services.php \
    && rm -f bootstrap/cache/events.php \
    ; \
    mkdir -p storage/framework/cache/data && \
    mkdir -p storage/framework/sessions && \
    mkdir -p storage/framework/testing && \
    mkdir -p storage/framework/views && \
    mkdir -p storage/logs && \
    mkdir -p bootstrap/cache && \
    cp .env.example .env && \
    php artisan wayfinder:generate --with-form

RUN rm -f /app/public/hot \
    && rm -rf /app/public/storage \
    && mkdir -p /app/public/storage \
    && npm run build

FROM base AS final

COPY --from=node-build /app/public/build /var/www/html/public/build
RUN mkdir -p /opt/app-public \
    && cp -a /var/www/html/public/. /opt/app-public/

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]
