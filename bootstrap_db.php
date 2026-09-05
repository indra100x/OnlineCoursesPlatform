<?php

use Illuminate\Container\Container;

require __DIR__.'/vendor/autoload.php';
require __DIR__.'/bootstrap/app.php';

$app = require __DIR__.'/bootstrap/app.php';

$container = $app->make(Container::class);
$db = $container->make('db');

try {
    echo "Dropping existing tables...\n";

    $connection = $db->connection();

    // Drop existing tables
    $connection->statement('DROP INDEX IF EXISTS sessions_last_activity_index');
    $connection->statement('DROP TABLE IF EXISTS sessions');
    $connection->statement('DROP TABLE IF EXISTS password_reset_tokens');
    $connection->statement('DROP INDEX IF EXISTS users_email_unique');
    $connection->statement('DROP TABLE IF EXISTS users');

    echo "Creating users table...\n";
    $connection->statement('
        CREATE TABLE users (
            id BIGSERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            remember_token VARCHAR(100),
            two_factor_secret TEXT,
            two_factor_recovery_codes TEXT,
            two_factor_confirmed_at TIMESTAMP,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        )
    ');

    echo "Creating unique index on users email...\n";
    $connection->statement('CREATE UNIQUE INDEX users_email_unique ON users(email)');

    echo "Creating password reset tokens table...\n";
    $connection->statement('
        CREATE TABLE password_reset_tokens (
            email VARCHAR(255) PRIMARY KEY,
            token VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NULL
        )
    ');

    echo "Creating sessions table...\n";
    $connection->statement('
        CREATE TABLE sessions (
            id VARCHAR(255) PRIMARY KEY,
            user_id BIGINT NULL,
            ip_address VARCHAR(45) NULL,
            user_agent TEXT NULL,
            payload TEXT NOT NULL,
            last_activity INTEGER NOT NULL
        )
    ');

    echo "Creating index on sessions last_activity...\n";
    $connection->statement('CREATE INDEX sessions_last_activity_index ON sessions(last_activity)');

    echo "\nAll tables created successfully!\n";
} catch (Exception $e) {
    echo 'Error: '.$e->getMessage()."\n";
    exit(1);
}
