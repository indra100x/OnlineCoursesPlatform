# CourseAtlas

Production-ready online courses platform built with Laravel 13 + React 19 + Inertia.js. Admin-managed access, teacher-owned course publishing, student beta purchasing, PDF chapter delivery, ratings, wishlists, notifications, and profile management.

## What this app does

Three roles with separated workspaces:

- **Admin** — Creates teacher and student accounts, manages teacher requests, views/updates/deletes users, audit logging
- **Teacher** — Creates paid courses, uploads PDF chapters, views enrolled students, receives rating insights
- **Student** — Browses paginated catalog, wishlists courses, beta purchases, enrolls with codes, reads chapters, rates courses, receives notifications

Public registration is disabled. Only the admin can create users. Teachers can request access via a public form.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Laravel 13 (PHP 8.3) |
| Auth | Laravel Fortify + MustVerifyEmail + 2FA |
| Frontend | React 19 + TypeScript 5.7 + React Compiler |
| Routing | React Router 7 (dashboard SPA) + Inertia.js 3 (initial load) |
| API client | Axios with CSRF auto-injection |
| Styling | Tailwind CSS 4 + Radix UI primitives |
| Database | PostgreSQL 16 (primary), SQLite (tests) |
| Cache / Queue / Session | Redis 7 |
| Monitoring | Sentry error tracking + structured JSON logging |
| Containerisation | Docker multi-stage build + docker-compose |
| CI/CD | GitHub Actions (3-job pipeline) |
| Code quality | PHPStan/Larastan (level 5), Laravel Pint, ESLint, Prettier |

## Feature summary

### Authentication and access control

- Login-only flow (no public registration)
- Role-based route protection via `EnsureUserHasRole` middleware (admin, teacher, student)
- MustVerifyEmail required for teachers and students
- Two-Factor Authentication with QR code, setup key, and recovery codes
- Rate limiting at two layers: nginx (auth 10r/m, API 30r/m, general 60r/m) + Laravel named limiters
- CSP security headers, HSTS, X-Frame-Options DENY, X-Request-ID tracing
- Secure session cookies (encrypted, HTTP-only, SameSite=Lax, secure, JSON serialization)
- CSRF token auto-refresh with 419 recovery
- Password complexity enforcement (min 12, mixed case, digits, symbols, HIBP check)
- Honeypot anti-spam on teacher registration
- Audit logging on all data mutations (async, with IP and user agent)

### Admin features

- Create teacher or student users with role validation
- View all users (paginated, 50 per page)
- Update users with FormRequest validation
- Delete users (with self-deletion prevention)
- Approve or reject teacher requests with admin notes
- View teacher requests (paginated, 20 per page)

### Teacher features

- Create paid courses with descriptions and prices
- Auto-generate unique enrollment codes
- Upload ordered PDF chapters with file size tracking
- View enrolled students per course
- See course rating signals in dashboard stats

### Student features

- Browse a paginated catalog of available courses (20 per page)
- Add or remove courses from a wishlist
- Complete a beta purchase to unlock a course code
- Enroll after purchase using the unlocked code
- Open PDF chapters
- Rate enrolled courses (1-5 with optional review)
- View and mark notifications as read

### Profile features

- Update display name and bio
- Upload profile photo (Cloudinary with local fallback)
- Change password with current-password verification
- Delete account

## Architecture

### Backend (Service Layer)

All business logic is extracted into dedicated services:

| Service | Responsibility |
|---------|---------------|
| `CourseService` | CRUD, paginated catalog queries, caching |
| `EnrollmentService` | Purchase, enroll, ownership checks |
| `ChapterService` | Chapter creation with file uploads (transactional) |
| `NotificationService` | Notifications list, mark read, caching |
| `TeacherRequestService` | Request submission, approval/rejection, password cleanup |
| `UserService` | User CRUD, password hashing, paginated listing |
| `CacheService` | Redis caching with pattern invalidation, 7 named TTLs |
| `AuditLogService` | Async audit trail creation via queue dispatch |
| `WishlistService` | Wishlist CRUD with idempotent operations |

### Policies

Authorization is enforced via policies:

| Policy | Methods |
|--------|---------|
| `CoursePolicy` | update, delete, manageChapters, viewStudents (ownership check) |
| `EnrollmentPolicy` | viewAny (admin/teacher), view (owner/admin/teacher), delete (owner) |
| `WishlistPolicy` | viewAny (student), view (owner), create (student), delete (owner) |
| `NotificationPolicy` | update (owner), delete (owner) |

### Form Requests

Validation is handled by dedicated Form Request classes:

- `Admin/UserStoreRequest`, `Admin/UserUpdateRequest`
- `Teacher/CourseStoreRequest`, `Teacher/CourseUpdateRequest`, `Teacher/ChapterStoreRequest`
- `Student/EnrollmentRequest`, `Student/RatingStoreRequest`, `Student/WishlistStoreRequest`
- `ProfileUpdateApiRequest`, `PasswordUpdateApiRequest`
- `TeacherRequestStoreRequest` (includes honeypot field)

### API Resources

JSON responses are normalized through API Resources:

- `UserResource`, `CourseResource`, `TeacherResource` (email hidden from public)
- `ChapterResource`, `NotificationResource`
- `RatingResource`, `ProfileResource`, `TeacherRequestResource`

### Event-Driven Architecture

Domain events trigger async jobs and audit logging:

| Event | Listener | Job |
|-------|----------|-----|
| `CourseCreated` | `UpdateCourseStats` + `LogAuditActivity` | `RefreshCourseCacheJob` |
| `CourseUpdated` | `UpdateCourseStats` + `LogAuditActivity` | `RefreshCourseCacheJob` |
| `CourseDeleted` | `UpdateCourseStats` + `LogAuditActivity` | `RefreshCourseCacheJob` |
| `ChapterCreated` | `SendChapterNotifications` + `LogAuditActivity` | `SendChapterNotificationsJob` |
| `CoursePurchased` | `LogAuditActivity` | — |
| `CourseEnrolled` | `LogAuditActivity` | — |
| `RatingSubmitted` | `LogAuditActivity` | — |

### Caching

Redis-backed caching via `CacheService`:

| Cache Key Pattern | TTL | Invalidation |
|-------------------|-----|-------------|
| `catalog:student:{id}:page:{n}` | 5 min | On any course mutation |
| `course:detail:{id}` | 10 min | On course update/delete |
| `courses:teacher:{id}` | 5 min | On teacher's course mutation |
| `courses:teacher:{id}:student:{sid}` | 5 min | On teacher's course mutation |
| `courses:enrolled:{id}` | 5 min | On enrollment |
| `notifications:unread:{id}` | 1 min | On notification read |
| `wishlist:student:{id}` | — | On wishlist change |

Pattern-based invalidation via Redis SCAN with graceful fallback for non-Redis drivers.

### Middleware

| Middleware | Purpose |
|-----------|---------|
| `EnsureUserHasRole` | Variadic role checking with strict comparison |
| `SecurityHeaders` | CSP, HSTS, X-Frame-Options, X-Request-ID, Referrer-Policy |
| `HandleInertiaRequests` | Shares auth user (safe fields only), CSRF token, sidebar state |
| `HandleAppearance` | Theme cookie to views |

### Scheduled Tasks

| Task | Frequency |
|------|-----------|
| `CleanupExpiredSessionsJob` | Daily |
| `cache:prune-stale-tags` | Hourly |
| `queue:prune-failed --hours=48` | Daily |
| `session:prune --hours=48` | Daily |

## Project structure

```text
app/
  Concerns/
    Auditable.php, PasswordValidationRules.php, ProfileValidationRules.php
  Events/
    ChapterCreated.php, CourseCreated.php, CourseUpdated.php
    CourseDeleted.php, CoursePurchased.php, CourseEnrolled.php, RatingSubmitted.php
  Exceptions/
    AuthorizationException.php, EnrollmentException.php, TeacherRequestException.php
  Http/
    Controllers/
      Admin/
        UserManagementController.php
      Student/
        CourseCatalogController.php, CoursePurchaseController.php
        CourseRatingController.php, EnrollmentController.php
        StudentCourseController.php, TeacherProfileController.php
        WishlistController.php
      Teacher/
        CourseController.php, CourseChapterController.php
        CourseStudentController.php, StudentProfileController.php
      Settings/
        ProfileController.php, SecurityController.php
      NotificationController.php, ProfileController.php
      TeacherRequestController.php
    Middleware/
      EnsureUserHasRole.php, SecurityHeaders.php
      HandleAppearance.php, HandleInertiaRequests.php
    Requests/
      Admin/, Teacher/, Student/, Profile/, Settings/
    Resources/
      UserResource.php, CourseResource.php, TeacherResource.php
      ChapterResource.php, NotificationResource.php
      RatingResource.php, ProfileResource.php
      TeacherRequestResource.php, CoursePurchaseResource.php
  Jobs/
    SendChapterNotificationsJob.php
    RefreshCourseCacheJob.php
    CleanupExpiredSessionsJob.php
  Listeners/
    SendChapterNotifications.php
    UpdateCourseStats.php
    LogAuditActivity.php
  Models/
    User.php, Course.php, Chapter.php, Enrollment.php
    Notification.php, CoursePurchase.php, CourseRating.php
    Wishlist.php, TeacherRequest.php, AuditLog.php
  Policies/
    CoursePolicy.php, EnrollmentPolicy.php
    WishlistPolicy.php, NotificationPolicy.php
  Services/
    CacheService.php, CourseService.php, EnrollmentService.php
    ChapterService.php, NotificationService.php
    TeacherRequestService.php, UserService.php
    AuditLogService.php, WishlistService.php

config/
  sentry.php                    Sentry DSN, sample rate, PII scrubbing

database/
  factories/
    UserFactory.php, CourseFactory.php, NotificationFactory.php
    TeacherRequestFactory.php, AuditLogFactory.php
  migrations/

resources/
  js/
    components/platform/
      stats-card.tsx, error-message.tsx, empty-state.tsx
      teacher-request-form.tsx
    hooks/
      use-student-data.ts, use-teacher-data.ts
      use-two-factor-auth.ts, use-flash-toast.ts
    lib/
      api.ts, utils.ts
    pages/
      dashboard.tsx, welcome.tsx
      platform/
        admin-dashboard.tsx, admin-teacher-requests.tsx
        teacher-dashboard.tsx, student-dashboard.tsx
        course-details-page.tsx, profile-page.tsx
        teacher-public-profile-page.tsx, student-profile-page.tsx
      auth/, settings/
    types/
      platform.ts, auth.ts, navigation.ts, ui.ts

tests/
  Feature/
    Admin/UserManagementTest.php
    Auth/ (6 test files)
    Teacher/ (2 test files)
    Student/ (5 test files)
    Settings/ (2 test files)
    SecurityTest.php, CacheServiceTest.php, AuditLogServiceTest.php
    TeacherRequestTest.php, ProfileTest.php, NotificationTest.php
  Unit/
    Services/CourseServiceTest.php
  Database/
    MigrationTest.php

docker/
  nginx/
    loadbalancer.conf            TLS-terminated load balancer
  php/
    php.ini
  certs/                         SSL certificates directory

.github/
  workflows/
    ci.yml                       3-job pipeline (PHP, frontend, Docker)
```

## Database design

PostgreSQL 16 primary database. All tables defined by Laravel migrations.

### Core tables

| Table | Purpose | Key Constraints |
| --- | --- | --- |
| `users` | Role-based users with avatar and bio | unique(email), soft deletes |
| `courses` | Teacher-owned paid courses | unique(enrollment_code), soft deletes |
| `enrollments` | Students enrolled in courses | unique(student_id, course_id) |
| `chapters` | Ordered PDF files | unique(course_id, position) |
| `course_purchases` | Beta purchases | unique(student_id, course_id), unique(reference) |
| `wishlists` | Student-saved courses | unique(student_id, course_id) |
| `course_ratings` | Student course ratings | unique(student_id, course_id) |
| `notifications` | Chapter release notifications | FK cascade on user/course/chapter |
| `teacher_requests` | Teacher access applications | unique(email) |
| `audit_logs` | Activity audit trail | polymorphic morphTo |

### Performance indexes

- `notifications`: `(user_id, is_read, created_at)`, `(user_id, is_read)`
- `courses`: `(teacher_id, created_at)`
- `enrollments`: `(student_id, created_at)`
- `course_purchases`: `(student_id, created_at)`
- `course_ratings`: `(course_id, rating)`
- `chapters`: `(course_id, position)`
- `teacher_requests`: `(status, created_at)`
- `users`: `role` index

## API overview

### Auth

- `POST /login`
- `POST /logout`

### Profile

- `GET /profile`
- `POST /profile`
- `DELETE /profile`
- `POST /profile/password`

### Admin

- `GET /users` (paginated)
- `POST /users`
- `PUT /users/{id}`
- `DELETE /users/{id}`
- `GET /teacher-requests` (paginated)
- `POST /teacher-requests/{id}/approve`
- `POST /teacher-requests/{id}/reject`

### Teacher

- `GET /courses`
- `POST /courses`
- `PUT /courses/{id}`
- `DELETE /courses/{id}`
- `POST /courses/{id}/chapters`
- `GET /courses/{id}/students`
- `GET /students/{id}/profile`

### Student

- `GET /catalog` (paginated)
- `GET /wishlist`
- `POST /wishlist`
- `DELETE /wishlist/{course}`
- `POST /courses/{course}/purchase`
- `POST /courses/{course}/ratings`
- `POST /enroll`
- `GET /my-courses`
- `GET /courses/{id}/chapters`
- `GET /teachers/{id}/profile`

### Notifications

- `GET /notifications`
- `PUT /notifications/{id}/read`

## Setup

### Option A — Docker (recommended)

**Requirements:** Docker + Docker Compose

1. Clone and start:

```bash
git clone <repo-url>
cd OnlineCoursesPlatform
cp .env.example .env
docker compose up -d
```

2. Open `http://localhost`

Docker setup includes:
- 2 app instances behind nginx load balancer (TLS-ready)
- PostgreSQL 16 with health checks
- Redis 7 with AOF persistence
- Queue worker with job recycling
- Scheduler
- Resource limits on all containers
- Migration lock file prevents race conditions
- Auto-seeding on first boot

### Option B — Manual

**Requirements:** PHP 8.3+, Composer, Node.js 22+, PostgreSQL 16, Redis 7

1. Install:

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate
```

2. Configure `.env` with your PostgreSQL and Redis credentials.

3. Migrate and seed:

```bash
php artisan migrate:fresh --seed
```

4. Start:

```bash
make dev
```

5. Open `http://127.0.0.1:8000`

### Option C — Makefile

```bash
make help          # Show all commands
make install       # Install dependencies
make setup-dev     # Full dev setup
make test          # Run tests
make lint          # Code style checks
make fix           # Auto-fix style
make build         # Build frontend
make docker-up     # Start Docker
```

## Testing

```bash
# Run all tests
php artisan test

# Run specific suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# Run specific test
php artisan test --filter=UserManagementTest
```

**100+ tests** covering:
- Authentication (login, logout, 2FA, registration, password reset, rate limiting)
- Authorization (role-based access, cross-role protection, notification ownership)
- Course management (CRUD, policy checks, event dispatch)
- Enrollment flow (purchase → enrollment, idempotency, validation)
- Ratings, wishlists, notifications
- Admin user management (CRUD, self-deletion prevention)
- Teacher request workflow (submit, approve, reject, duplicate rejection)
- Cache service (remember, forget, key formats, invalidation)
- Audit logging (dispatch, parameters, recent queries)
- Profile management (update, password change, avatar upload, account deletion)
- Database migration schema verification

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) — 3-job pipeline:

**Job 1: PHP Tests**
- PostgreSQL 16 + Redis 7 service containers
- PHP 8.3 with all required extensions
- Composer dependency caching
- Laravel Pint code style check
- PHPStan static analysis
- Full PHPUnit test suite

**Job 2: Frontend Checks**
- Node.js 22 with npm cache
- ESLint check
- Prettier format check
- TypeScript type check

**Job 3: Docker Build** (runs after PHP + frontend pass)
- Multi-stage Docker image build
- PHP version verification

## Monitoring

- **Sentry** — Error tracking with DSN, 20% trace sampling, Git SHA release tracking, PII scrubbing
- **Structured JSON Logging** — Monolog JsonFormatter to stderr for container log aggregation
- **Request Tracing** — X-Request-ID UUID on every response for distributed tracing
- **Audit Trail** — Async audit logs with IP, user agent, old/new values for all mutations

## Security

- Passwords are never stored in teacher requests after approval
- Rate limiting at two layers: nginx + Laravel (13 named limiters)
- CSP headers with Cloudinary allowlist
- HSTS on HTTPS connections
- X-Frame-Options DENY prevents clickjacking
- Secure session cookies (encrypted, HTTP-only, SameSite=Lax, JSON serialization)
- CSRF token auto-refresh with 419 recovery
- Password complexity enforcement (min 12, mixed case, digits, symbols, HIBP compromised check)
- Honeypot anti-spam on teacher registration
- Teacher email hidden from public profiles
- Sentry PII scrubbing (only user ID sent)
- APP_KEY validation on container startup
- Input length validation on all fields
- Ownership validation on all resource modifications
- Audit logging on all data mutations
- MustVerifyEmail for teachers and students
- Two-Factor Authentication with recovery codes
