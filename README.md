# Online Courses Platform

Production-oriented Laravel + React course platform with admin-managed access, teacher-owned course publishing, student beta purchasing, PDF and video chapter delivery, ratings, wishlists, and profile management.

## What this app does

This platform has three roles:

- `Admin`
  - Creates teacher and student accounts
  - Updates or removes users
- `Teacher`
  - Creates paid courses
  - Uploads PDF or video chapters
  - Views enrolled students
  - Receives rating insight through course metrics
- `Student`
  - Updates profile and password
  - Browses a course catalog
  - Adds courses to a wishlist
  - Uses a beta purchase flow to unlock enrollment codes
  - Enrolls after purchase
  - Reads PDF and video chapters
  - Rates enrolled courses
  - Receives notifications for new chapter releases

Public registration is disabled. Only the admin can create users.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Laravel 13 (PHP 8.3) |
| Auth | Laravel Fortify session authentication |
| Frontend | React 19 |
| Routing | React Router |
| API client | Axios |
| Styling | Tailwind CSS 4 |
| Database | MySQL 8.0 |
| Containerisation | Docker + docker-compose |

## Feature summary

### Authentication and access control

- Login-only flow
- No public registration
- Role-based route protection
- Hashed passwords
- Session-based authentication

### Admin features

- Create teacher or student users
- View all users
- Update users
- Delete users

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

- Update display name
- Update bio
- Upload profile photo
- Change password

## Frontend experience

The dashboard UI was upgraded from the starter feel into a more polished glass-and-gradient interface:

- Stronger color atmosphere and layered gradients
- Better visual separation between role workspaces
- Profile-aware shell with avatar support
- More premium student catalog and purchase flow
- Cleaner teacher course management and mixed chapter publishing workflow

## Project structure

```text
app/
  Http/
    Controllers/
      Admin/
      Student/
      Teacher/
      NotificationController.php
      ProfileController.php
    Middleware/
      EnsureUserHasRole.php
  Models/
    User.php
    Course.php
    Enrollment.php
    Chapter.php
    Notification.php
    CoursePurchase.php
    CourseRating.php
    Wishlist.php

database/
  migrations/
  schema/
    online_courses_platform.sql
  seeders/
    DatabaseSeeder.php

resources/
  js/
    components/platform/
    lib/api.ts
    pages/
      dashboard.tsx
      platform/
        admin-dashboard.tsx
        teacher-dashboard.tsx
        student-dashboard.tsx
        course-details-page.tsx
        profile-page.tsx

routes/
  web.php
```

## Database design

The live schema is defined by Laravel migrations.

Reference SQL:
- [database/schema/online_courses_platform.sql](/C:/Users/computer%20house%2041/Desktop/web-project/database/schema/online_courses_platform.sql)

### Core tables

| Table | Purpose |
| --- | --- |
| `users` | Stores role-based users plus avatar and bio |
| `courses` | Stores teacher-owned paid courses |
| `enrollments` | Stores students enrolled in courses |
| `chapters` | Stores ordered PDF files or video lesson links |
| `course_purchases` | Stores beta purchases that unlock enrollment codes |
| `wishlists` | Stores student-saved courses |
| `course_ratings` | Stores student course ratings and reviews |
| `notifications` | Stores chapter release notifications |

### Important schema decisions

- `users.role` uses an enum constraint
- `courses.price` enables beta purchase behavior
- `chapters.position` keeps chapter order explicit
- chapter content supports either `pdf` or `video`
- `course_purchases` prevents duplicate purchases per student/course
- `course_ratings` prevents duplicate ratings per student/course
- `notifications.type` and `notifications.data` support future notification expansion

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

### Option A — Docker (recommended)

### Requirements

- Docker + Docker Compose

### Install

1. Copy and configure environment:

```bash
copy .env.example .env
```

2. Build and start all services:

```bash
docker compose up -d
```

3. Generate app key and run migrations:

```bash
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

4. Open:

```text
http://localhost
```

---

### Option B — Manual

### Requirements

- PHP 8.3+
- Composer
- Node.js + npm
- MySQL 8.0

### Install

1. Create `.env`:

```bash
copy .env.example .env
```

2. Set your MySQL credentials in `.env` (host `127.0.0.1`, DB name `laravel`, your username/password).

> **Tip:** If using XAMPP, use `root` with an empty password.

3. Install dependencies and prepare the database:

```bash
composer install
npm install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
```

4. Start the app:

```bash
composer run dev
```

5. Open:

```text
http://127.0.0.1:8000
```

The root route redirects directly to `/login`.

## Default admin account

| Field | Value |
| --- | --- |
| Email | `admin@courses.test` |
| Password | `AdminPass123!` |

Change this password immediately in a real deployment.

## Verification

These checks pass:

- `php artisan test`
- `npm run types:check`
- `npm run build`
