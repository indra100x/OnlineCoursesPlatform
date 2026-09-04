<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class EnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'enrollment_code' => ['required', 'string', 'exists:courses,enrollment_code'],
        ];
    }
}
