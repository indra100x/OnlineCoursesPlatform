# CourseAtlas

Production-ready online courses platform built with Laravel 13 + React 19 + Inertia.js. Admin-managed access, teacher-owned course publishing, student beta purchasing, PDF and video chapter delivery, ratings, wishlists, notifications, and profile management.

## What this app does

Three roles with separated workspaces:

- **Admin** - Creates teacher and student accounts, manages teacher requests, views/updates/deletes users, audit logging
- **Teacher** - Creates paid courses, uploads PDF/video chapters, views enrolled students, receives rating insights
- **Student** - Browses catalog, wishlists courses, beta purchases, enrolls with codes, reads chapters, rates courses, receives notifications

Public registration is disabled. Only the admin can create users. Teachers can request access via a public form.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Laravel 13 (PHP 8.3) |
| Auth | Laravel Fortify session authentication |
| Frontend | React 19 |
| Routing | React Router (dashboard SPA) + Inertia.js (initial load) |
| API client | Axios |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL 16 (primary), SQLite (tests) |
| Cache / Queue / Session | Redis 7 |
| Containerisation | Docker + docker-compose |
| CI/CD | GitHub Actions |

## Feature summary

### Authentication and access control

- Login-only flow (no public registration)
- Role-based route protection via `EnsureUserHasRole` middleware
- Rate limiting on critical endpoints (login, purchase, enrollment, rating, wishlist)
- CSP security headers
- Secure session cookies (HTTP-only, SameSite=Lax, secure)
- CSRF token auto-refresh with 419 recovery
- Password complexity enforcement (min 12, mixed case, digits, symbols)
- Audit logging on all data mutations

### Admin features

- Create teacher or student users
- View all users with API Resources
- Update users with Form Request validation
- Delete users (with self-deletion prevention)
- Approve or reject teacher requests

### Teacher features

- Create paid courses with descriptions and prices
- Auto-generate enrollment codes
- Upload ordered PDF or video chapters
- View enrolled students
- See course rating signals in dashboard stats

### Student features

- View a catalog of available courses
- Add or remove courses from a wishlist
- Complete a beta purchase to unlock a course code
- Enroll after purchase using the unlocked code
- Open PDF and video chapters
- Rate enrolled courses
- View and mark notifications as read

### Profile features

- Update display name and bio
- Upload profile photo
- Change password with current-password verification

## Architecture

### Backend (Service Layer)

All business logic is extracted into dedicated services:

| Service | Responsibility |
|---------|---------------|
| `CourseService` | CRUD, catalog queries, caching |
| `EnrollmentService` | Purchase, enroll, ownership checks |
| `ChapterService` | Chapter creation with file uploads |
| `NotificationService` | Notifications list, mark read, caching |
| `TeacherRequestService` | Request approval/rejection, password cleanup |
| `UserService` | User CRUD, password hashing |

### Form Requests

Validation is handled by dedicated Form Request classes:

- `Admin/UserStoreRequest`, `Admin/UserUpdateRequest`
- `Teacher/CourseStoreRequest`, `Teacher/CourseUpdateRequest`, `Teacher/ChapterStoreRequest`
- `Student/EnrollmentRequest`, `Student/RatingStoreRequest`, `Student/WishlistStoreRequest`
- `ProfileUpdateApiRequest`, `PasswordUpdateApiRequest`
- `TeacherRequestStoreRequest`

### API Resources

JSON responses are normalized through API Resources:

- `UserResource`, `CourseResource`, `TeacherResource`
- `ChapterResource`, `NotificationResource`
- `RatingResource`, `ProfileResource`, `TeacherRequestResource`

### Event-Driven Architecture

Domain events trigger async jobs and audit logging:

| Event | Listener | Job |
|-------|----------|-----|
| `CourseCreated` | `UpdateCourseStats` | `UpdateCourseStatsJob` |
| `CourseUpdated` | `UpdateCourseStats` | `UpdateCourseStatsJob` |
| `CourseDeleted` | `UpdateCourseStats` | `UpdateCourseStatsJob` |
| `ChapterCreated` | `SendChapterNotifications` | `SendChapterNotificationsJob` |
| `CoursePurchased` | `LogAuditActivity` | - |
| `CourseEnrolled` | `LogAuditActivity` | - |
| `RatingSubmitted` | `LogAuditActivity` | - |

### Caching

Redis-backed caching via `CacheService`:

- Course catalog (5 min TTL)
- Course detail (10 min TTL)
- Teacher courses (5 min TTL)
- Enrolled courses (5 min TTL)
- Notification counts (1 min TTL)
- Automatic cache invalidation on mutations

## Project structure

```text
app/
  Concerns/
    Auditable.php
  Events/
    ChapterCreated.php, CourseCreated.php, CourseUpdated.php
    CourseDeleted.php, CoursePurchased.php, CourseEnrolled.php
    RatingSubmitted.php
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
      NotificationController.php, ProfileController.php
      TeacherRequestController.php
    Middleware/
      EnsureUserHasRole.php, SecurityHeaders.php
    Requests/
      Admin/, Teacher/, Student/, Profile/
    Resources/
      UserResource.php, CourseResource.php, TeacherResource.php
      ChapterResource.php, NotificationResource.php
      RatingResource.php, ProfileResource.php
      TeacherRequestResource.php
  Jobs/
    SendChapterNotificationsJob.php
    UpdateCourseStatsJob.php
    CleanupExpiredSessionsJob.php
  Listeners/
    SendChapterNotifications.php
    UpdateCourseStats.php
    LogAuditActivity.php
  Models/
    User.php, Course.php, Chapter.php, Enrollment.php
    Notification.php, CoursePurchase.php, CourseRating.php
    Wishlist.php, TeacherRequest.php, AuditLog.php
  Services/
    CacheService.php, CourseService.php, EnrollmentService.php
    ChapterService.php, NotificationService.php
    TeacherRequestService.php, UserService.php

database/
  factories/
    UserFactory.php, CourseFactory.php, NotificationFactory.php
  migrations/
  seeders/

resources/
  js/
    components/platform/
    lib/api.ts
    pages/
      dashboard.tsx
      platform/
        admin-dashboard.tsx, teacher-dashboard.tsx
        student-dashboard.tsx, course-details-page.tsx
        profile-page.tsx

tests/
  Feature/
    Admin/UserManagementTest.php
    Teacher/CourseManagementTest.php
    Student/CourseCatalogTest.php
    NotificationTest.php, ProfileTest.php
  Unit/
    Models/UserTest.php, CourseTest.php
    Services/CourseServiceTest.php
  Database/
    MigrationTest.php

scripts/
  deploy.sh

docker/
  nginx/
    default.conf, loadbalancer.conf

.github/
  workflows/
    ci.yml
```

## Database design

PostgreSQL 16 primary database. All tables defined by Laravel migrations.

### Core tables

| Table | Purpose |
| --- | --- |
| `users` | Role-based users with avatar and bio |
| `courses` | Teacher-owned paid courses |
| `enrollments` | Students enrolled in courses |
| `chapters` | Ordered PDF files or video lessons |
| `course_purchases` | Beta purchases that unlock enrollment codes |
| `wishlists` | Student-saved courses |
| `course_ratings` | Student course ratings and reviews |
| `notifications` | Chapter release notifications |
| `teacher_requests` | Teacher access applications |
| `audit_logs` | Activity audit trail |

### Performance indexes

- `notifications`: `(user_id, is_read, created_at)`
- `courses`: `(teacher_id, created_at)`
- `enrollments`: `(student_id, created_at)`
- `course_purchases`: `(student_id, created_at)`
- `course_ratings`: `(course_id, rating)`
- `chapters`: `(course_id, position)`

## API overview

### Auth

- `POST /login`
- `POST /logout`

### Profile

- `GET /profile`
- `POST /profile`
- `POST /profile/password`

### Admin

- `GET /users`
- `POST /users`
- `PUT /users/{id}`
- `DELETE /users/{id}`
- `GET /teacher-requests`
- `POST /teacher-requests/{id}/approve`
- `POST /teacher-requests/{id}/reject`

### Teacher

- `GET /courses`
- `POST /courses`
- `PUT /courses/{id}`
- `DELETE /courses/{id}`
- `POST /courses/{id}/chapters`
- `GET /courses/{id}/students`

### Student

- `GET /catalog`
- `GET /wishlist`
- `POST /wishlist`
- `DELETE /wishlist/{course}`
- `POST /courses/{course}/purchase`
- `POST /courses/{course}/ratings`
- `POST /enroll`
- `GET /my-courses`
- `GET /courses/{id}/chapters`

### Notifications

- `GET /notifications`
- `PUT /notifications/{id}/read`

## Setup

### Option A - Docker (recommended)

**Requirements:** Docker + Docker Compose

1. Clone and start:

```bash
git clone <repo-url>
cd OnlineCoursesPlatform
cp .env.example .env
docker compose up -d
```

2. Generate key and migrate:

```bash
docker compose exec app-1 php artisan key:generate
docker compose exec app-1 php artisan migrate --seed
```

3. Open `http://localhost`

Docker setup includes:
- 2 app instances with nginx load balancing
- PostgreSQL 16
- Redis 7
- Queue worker
- Scheduler

### Option B - Manual

**Requirements:** PHP 8.3+, Composer, Node.js + npm, PostgreSQL 16, Redis 7

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

### Option C - Makefile

All common commands are available via Make:

```bash
make help          # Show all commands
make install       # Install dependencies
make setup-dev     # Full dev setup
make test          # Run tests
make lint          # Code style checks
make fix           # Auto-fix style
make build         # Build frontend
make deploy        # Run deployment script
make docker-up     # Start Docker
```

## Default admin account

| Field | Value |
| --- | --- |
| Email | `admin@courses.test` |
| Password | `AdminPass123!` |

Change this password immediately in production.

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

**43 tests** covering:
- Unit tests for models and services
- Feature tests for all API endpoints
- Database migration tests
- Authorization and validation tests

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

- Runs on push to `main`/`develop` and PRs to `main`
- PostgreSQL + Redis service containers
- PHPStan static analysis
- Pint code style checks
- Full test suite
- Frontend build verification
- Auto-deploy to staging on `develop` branch

## Deployment

```bash
# Run the deployment script
make deploy
# or
bash scripts/deploy.sh
```

The script handles:
- Git pull
- Composer install (production optimized)
- Frontend build
- Database migrations
- Config/route/view caching
- Queue worker restart

## Security

- Passwords are never stored in teacher requests after approval
- Rate limiting on all mutation endpoints
- CSP headers enabled
- Secure session cookies
- CSRF token auto-refresh
- Input length validation (description max 5000 chars)
- Ownership validation on all resource modifications
- Audit logging on all data mutations
