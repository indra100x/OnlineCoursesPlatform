<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheStaticAssets
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->isApiRequest($request)) {
            return $next($request);
        }

        $response = $next($request);

        if ($this->isStaticAsset($request->path())) {
            $response->header('Cache-Control', 'public, max-age=31536000, immutable');
            $response->header('Expires', gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
        } else {
            $response->header('Cache-Control', 'private, no-cache, must-revalidate');
        }

        return $response;
    }

    private function isApiRequest(Request $request): bool
    {
        return $request->expectsJson() || $request->is('api/*');
    }

    private function isStaticAsset(string $path): bool
    {
        return preg_match('/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*)?$/i', $path);
    }
}
