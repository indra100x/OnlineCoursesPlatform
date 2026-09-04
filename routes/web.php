<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Student\CourseCatalogController;
use App\Http\Controllers\Student\CoursePurchaseController;
use App\Http\Controllers\Student\CourseRatingController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\Student\StudentCourseController;
use App\Http\Controllers\Student\TeacherProfileController;
use App\Http\Controllers\Student\WishlistController;
use App\Http\Controllers\Teacher\CourseChapterController;
use App\Http\Controllers\Teacher\CourseController;
use App\Http\Controllers\Teacher\CourseStudentController;
use App\Http\Controllers\Teacher\StudentProfileController;
use App\Http\Controllers\TeacherRequestController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/teacher-register', fn () => Inertia::render('auth/teacher-register'))
    ->middleware('throttle:registration')
    ->name('teacher.register');

Route::post('/teacher-requests', [TeacherRequestController::class, 'store'])
    ->middleware('throttle:teacher-requests');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard/{any?}', fn () => Inertia::render('dashboard'))
        ->where('any', '.*')
        ->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update'])->middleware('throttle:profile');
    Route::post('/profile/password', [ProfileController::class, 'updatePassword'])->middleware('throttle:profile');

    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserManagementController::class, 'index'])->middleware('throttle:admin');
        Route::post('/users', [UserManagementController::class, 'store'])->middleware('throttle:admin');
        Route::put('/users/{user}', [UserManagementController::class, 'update'])->middleware('throttle:admin');
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->middleware('throttle:admin');

        Route::get('/teacher-requests', [TeacherRequestController::class, 'index'])->middleware('throttle:admin');
        Route::post('/teacher-requests/{teacherRequest}/approve', [TeacherRequestController::class, 'approve'])->middleware('throttle:admin');
        Route::post('/teacher-requests/{teacherRequest}/reject', [TeacherRequestController::class, 'reject'])->middleware('throttle:admin');
    });

    Route::middleware('role:teacher')->group(function () {
        Route::get('/courses', [CourseController::class, 'index'])->middleware('throttle:teacher');
        Route::post('/courses', [CourseController::class, 'store'])->middleware('throttle:teacher');
        Route::put('/courses/{course}', [CourseController::class, 'update'])->middleware('throttle:teacher');
        Route::delete('/courses/{course}', [CourseController::class, 'destroy'])->middleware('throttle:teacher');
        Route::post('/courses/{course}/chapters', [CourseChapterController::class, 'store'])->middleware('throttle:teacher');
        Route::get('/courses/{course}/students', [CourseStudentController::class, 'index'])->middleware('throttle:teacher');
        Route::get('/students/{student}/profile', [StudentProfileController::class, 'show'])->middleware('throttle:teacher');
    });

    Route::middleware('role:student')->group(function () {
        Route::get('/catalog', [CourseCatalogController::class, 'index']);
        Route::get('/teachers/{teacher}/profile', [TeacherProfileController::class, 'show']);
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store'])->middleware('throttle:wishlist');
        Route::delete('/wishlist/{course}', [WishlistController::class, 'destroy'])->middleware('throttle:wishlist');
        Route::post('/courses/{course}/purchase', [CoursePurchaseController::class, 'store'])->middleware('throttle:purchase');
        Route::post('/courses/{course}/ratings', [CourseRatingController::class, 'store'])->middleware('throttle:rating');
        Route::post('/enroll', [EnrollmentController::class, 'store'])->middleware('throttle:enrollment');
        Route::get('/my-courses', [StudentCourseController::class, 'index']);
        Route::get('/courses/{course}/chapters', [StudentCourseController::class, 'chapters']);
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    });
});

require __DIR__.'/settings.php';
