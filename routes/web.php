<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Student\CourseCatalogController;
use App\Http\Controllers\Student\CoursePurchaseController;
use App\Http\Controllers\Student\CourseRatingController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\Student\StudentCourseController;
use App\Http\Controllers\Student\WishlistController;
use App\Http\Controllers\Teacher\CourseChapterController;
use App\Http\Controllers\Teacher\CourseController;
use App\Http\Controllers\Teacher\CourseStudentController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard/{any?}', fn () => Inertia::render('dashboard'))
        ->where('any', '.*')
        ->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::post('/users', [UserManagementController::class, 'store']);
        Route::put('/users/{user}', [UserManagementController::class, 'update']);
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy']);
    });

    Route::middleware('role:teacher')->group(function () {
        Route::get('/courses', [CourseController::class, 'index']);
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{course}', [CourseController::class, 'update']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
        Route::post('/courses/{course}/chapters', [CourseChapterController::class, 'store']);
        Route::get('/courses/{course}/students', [CourseStudentController::class, 'index']);
    });

    Route::middleware('role:student')->group(function () {
        Route::get('/catalog', [CourseCatalogController::class, 'index']);
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store']);
        Route::delete('/wishlist/{course}', [WishlistController::class, 'destroy']);
        Route::post('/courses/{course}/purchase', [CoursePurchaseController::class, 'store']);
        Route::post('/courses/{course}/ratings', [CourseRatingController::class, 'store']);
        Route::post('/enroll', [EnrollmentController::class, 'store']);
        Route::get('/my-courses', [StudentCourseController::class, 'index']);
        Route::get('/courses/{course}/chapters', [StudentCourseController::class, 'chapters']);
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    });
});

require __DIR__.'/settings.php';
