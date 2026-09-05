<?php

namespace App\Support;

use Illuminate\Http\Client\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class MediaStorage
{
    public function storeImage(UploadedFile $file, string $folder): string
    {
        return $this->store($file, $folder, 'image');
    }

    public function storeDocument(UploadedFile $file, string $folder): string
    {
        return $this->store($file, $folder, 'raw');
    }

    protected function store(UploadedFile $file, string $folder, string $resourceType): string
    {
        if (! $this->isCloudinaryConfigured()) {
            return $file->store($folder, 'public');
        }

        $timestamp = time();
        $publicId = trim($folder, '/').'/'.Str::uuid()->toString();
        $params = array_filter([
            'folder' => trim($folder, '/'),
            'public_id' => $publicId,
            'resource_type' => $resourceType,
            'timestamp' => $timestamp,
        ], fn (mixed $value): bool => $value !== null && $value !== '');

        $response = Http::asMultipart()
            ->attach(
                'file',
                file_get_contents($file->getRealPath()),
                $file->getClientOriginalName(),
                ['Content-Type' => $file->getMimeType() ?: 'application/octet-stream']
            )
            ->post($this->uploadUrl($resourceType), [
                ...$params,
                'api_key' => config('services.cloudinary.key'),
                'signature' => $this->signature($params),
            ]);

        if (! $response->successful()) {
            throw new RuntimeException($this->uploadError($response));
        }

        return (string) $response->json('secure_url');
    }

    protected function isCloudinaryConfigured(): bool
    {
        return filled(config('services.cloudinary.cloud_name'))
            && filled(config('services.cloudinary.key'))
            && filled(config('services.cloudinary.secret'));
    }

    protected function uploadUrl(string $resourceType): string
    {
        return sprintf(
            'https://api.cloudinary.com/v1_1/%s/%s/upload',
            config('services.cloudinary.cloud_name'),
            $resourceType
        );
    }

    /**
     * @param  array<string, mixed>  $params
     */
    protected function signature(array $params): string
    {
        ksort($params);

        $signatureBase = collect($params)
            ->map(fn (mixed $value, string $key): string => $key.'='.$value)
            ->implode('&');

        return sha1($signatureBase.config('services.cloudinary.secret'));
    }

    protected function uploadError(Response $response): string
    {
        $message = $response->json('error.message');

        return is_string($message) && $message !== ''
            ? $message
            : 'Unable to upload media.';
    }
}
