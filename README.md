# Online Courses Platform

Admin-managed online learning platform built with Laravel, React, React Router, Axios, and MySQL.

## Overview

This project is a role-based course platform with three user types:

- `Admin`: creates and manages teacher and student accounts
- `Teacher`: creates courses, adds chapters, and views enrolled students
- `Student`: logs in, enrolls with a course code, reads chapters, and receives notifications

Public sign-up is disabled. Only the admin can create user accounts.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Laravel 13 |
| Auth | Laravel Fortify session authentication |
| Frontend | React 19 |
| Routing | React Router |
| HTTP client | Axios |
| Styling | Tailwind CSS |
| Database | MySQL |

## Feature summary

### Authentication

- Login only
- No public registration
- Role-based access control
- Password hashing with Laravel's hashed password cast

### Admin

- Create teacher and student accounts
- View all users
- Update users
- Delete users

### Teacher

- Create and manage courses
- Auto-generate enrollment codes
- Add ordered chapters
- View enrolled students
- Trigger notifications when a new chapter is published

### Student

- Enroll with an enrollment code
- View enrolled courses
- Open course chapters
- Read and mark notifications

## Project structure

```text
app/
  Http/
    Controllers/
      Admin/
      Student/
      Teacher/
      NotificationController.php
    Middleware/
      EnsureUserHasRole.php
  Models/
    User.php
    Course.php
    Enrollment.php
    Chapter.php
    Notification.php

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

routes/
  web.php
```

## Database design

The live schema is implemented with Laravel migrations.

Plain SQL reference:
- [database/schema/online_courses_platform.sql](/C:/Users/computer%20house%2041/Desktop/web-project/database/schema/online_courses_platform.sql)

### Core tables

| Table | Purpose |
| --- | --- |
| `users` | Stores admin, teacher, and student accounts |
| `courses` | Stores courses owned by teachers |
| `enrollments` | Stores student-to-course membership |
| `chapters` | Stores ordered learning content within a course |
| `notifications` | Stores user notifications when new chapters are added |

### Schema improvements applied

- `users.role` is now constrained with `ENUM('admin', 'teacher', 'student')`
- `chapters.position` controls explicit chapter ordering
- `notifications.type` supports structured notification categories
- `notifications.data` stores JSON payload for future-friendly rendering
- `enrollments.enrolled_at` records the enrollment moment explicitly
- Indexes were added for common lookup columns

## API design

### Auth

- `POST /login`
- `POST /logout`

### Admin

- `POST /users`
- `GET /users`
- `PUT /users/{id}`
- `DELETE /users/{id}`

### Teacher

- `POST /courses`
- `GET /courses`
- `PUT /courses/{id}`
- `DELETE /courses/{id}`
- `POST /courses/{id}/chapters`
- `GET /courses/{id}/students`

### Student

- `POST /enroll`
- `GET /my-courses`
- `GET /courses/{id}/chapters`

### Notifications

- `GET /notifications`
- `PUT /notifications/{id}/read`

## Backend implementation

### 1. Authentication and authorization

- Fortify handles login and session auth
- Registration is disabled
- `EnsureUserHasRole` middleware protects role-specific endpoints

### 2. Domain models

- `User` contains role helpers for admin, teacher, and student checks
- `Course` auto-generates enrollment codes
- `Enrollment` records student membership and `enrolled_at`
- `Chapter` stores ordered content with `position`
- `Notification` stores message text plus structured metadata

### 3. Business flows

- Admin creates teacher and student accounts
- Teachers create courses and publish chapters
- Publishing a chapter creates one database notification per enrolled student
- Students enroll using a course code and can read ordered chapter content

## Frontend implementation

### 1. App shell

- The default starter dashboard was replaced with a role-aware React Router shell
- Axios is used for authenticated backend calls

### 2. Dashboards

- Admin dashboard: user management
- Teacher dashboard: course management, chapter publishing, enrolled students
- Student dashboard: course enrollment, course list, notifications

### 3. Course details

- Students open a dedicated course details page
- Chapters are shown in `position` order
- Text, video links, and uploaded files are supported

## Local setup

### Requirements

- PHP 8.3+
- Composer
- Node.js + npm
- MySQL

### Installation

1. Create your environment file if needed:

```bash
copy .env.example .env
```

2. Configure MySQL credentials in `.env`

3. Run the project setup:

```bash
composer install
npm install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

4. Start development services:

```bash
composer run dev
```

5. Open:

```text
http://127.0.0.1:8000/login
```

## Default admin account

| Field | Value |
| --- | --- |
| Email | `admin@courses.test` |
| Password | `AdminPass123!` |

Change this password immediately in any real deployment.

## Verification

The following checks pass:

- `php artisan test`
- `npm run types:check`
- `npm run build`
