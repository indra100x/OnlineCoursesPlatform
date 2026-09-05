<?php

use Sentry\Event;

return [

    /*
    |--------------------------------------------------------------------------
    | Sentry DSN
    |--------------------------------------------------------------------------
    |
    | The Sentry DSN is configured via the SENTRY_LARAVEL_DSN environment
    | variable. If the variable is not set, Sentry reporting is disabled.
    |
    */

    'dsn' => env('SENTRY_LARAVEL_DSN'),

    /*
    |--------------------------------------------------------------------------
    | Release / Version
    |--------------------------------------------------------------------------
    |
    | A unique identifier for the release of your application. This is
    | used to group events for a specific deploy.
    |
    */

    'release' => env('SENTRY_RELEASE', trim(exec('git rev-parse HEAD'))),

    /*
    |--------------------------------------------------------------------------
    | Environment
    |--------------------------------------------------------------------------
    |
    | The environment variable tells Sentry which environment the current
    | code is running in (e.g. production, staging).
    |
    */

    'environment' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Error Types
    |--------------------------------------------------------------------------
    |
    | Sentry errors can be reported for various PHP error types. By default,
    | all errors except E_USER_ERROR and E_DEPRECATED are reported.
    |
    */

    'error_types' => E_ALL & ~E_USER_ERROR & ~E_DEPRECATED,

    /*
    |--------------------------------------------------------------------------
    | Sample Rate
    |--------------------------------------------------------------------------
    |
    | Controls the percentage of events that are sent to Sentry.
    | 1.0 = 100% of events. Set to 0.5 to send 50% of events.
    |
    */

    'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 0.2),

    /*
    |--------------------------------------------------------------------------
    | Send Default PII
    |--------------------------------------------------------------------------
    |
    | If this option is enabled, Sentry will try to extract user IP and
    | user email from the request and include it in the event.
    |
    */

    'send_default_pii' => env('SENTRY_SEND_DEFAULT_PII', false),

    /*
    |--------------------------------------------------------------------------
    | Before Send
    |--------------------------------------------------------------------------
    |
    | An optional callback to modify the event before it is sent to Sentry.
    |
    */

    'before_send' => function (Event $event): ?Event {
        // Scrub sensitive data before sending
        $request = request();

        if ($request) {
            $event->setUser([
                'id' => $request->user()?->id,
            ]);
        }

        return $event;
    },

];
