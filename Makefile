.PHONY: help install test lint deploy setup-dev

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	composer install
	npm install

setup-dev: ## Setup development environment
	cp -n .env.example .env || true
	php artisan key:generate
	php artisan migrate:fresh --seed
	npm install
	npm run dev

test: ## Run all tests
	php artisan test

test-unit: ## Run unit tests only
	php artisan test --testsuite=Unit

test-feature: ## Run feature tests only
	php artisan test --testsuite=Feature

test-coverage: ## Run tests with coverage
	php artisan test --coverage --min=70

lint: ## Run code style checks
	vendor/bin/pint --test
	vendor/bin/phpstan analyse --no-progress || true

fix: ## Fix code style issues
	vendor/bin/pint

analyze: ## Run static analysis
	vendor/bin/phpstan analyse

build: ## Build frontend assets
	npm run build

dev: ## Start development servers
	php artisan serve
	npm run dev

migrate: ## Run database migrations
	php artisan migrate

migrate-fresh: ## Fresh migration with seeding
	php artisan migrate:fresh --seed

cache-clear: ## Clear all caches
	php artisan cache:clear
	php artisan config:clear
	php artisan route:clear
	php artisan view:clear
	php artisan event:clear

cache-optimize: ## Cache configurations for production
	php artisan config:cache
	php artisan route:cache
	php artisan view:cache
	php artisan event:cache

deploy: ## Deploy to production
	bash scripts/deploy.sh

docker-up: ## Start Docker containers
	docker compose up -d

docker-down: ## Stop Docker containers
	docker compose down

docker-logs: ## View Docker logs
	docker compose logs -f

queue-work: ## Start queue worker
	php artisan queue:work redis --tries=3

schedule-run: ## Run scheduled tasks
	php artisan schedule:run
