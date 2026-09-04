<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class TeacherRequestStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email', 'unique:teacher_requests,email'],
            'password' => ['required', 'string', 'min:12', Password::defaults()],
            'bio' => ['nullable', 'string', 'max:1000'],
            'proof_link' => ['nullable', 'url', 'max:2048'],
        ];
    }
}
