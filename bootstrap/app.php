<?php

use App\Exceptions\AuthorizationException;
use App\Exceptions\EnrollmentException;
use App\Exceptions\TeacherRequestException;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);

        $middleware->web(append: [
            SecurityHeaders::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (EnrollmentException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 403);
        });

        $exceptions->renderable(function (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 403);
        });

        $exceptions->renderable(function (TeacherRequestException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 422);
        });

        $exceptions->reportable(function (Throwable $e) {
            if (function_exists('sentry')) {
                sentry()->captureException($e);
            }
        });
    })->create();
