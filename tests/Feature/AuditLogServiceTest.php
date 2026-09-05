<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Services\AuditLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_log_creates_audit_entry(): void
    {
        AuditLogService::log(
            action: 'course_created',
            auditableType: 'App\\Models\\Course',
            auditableId: 42,
            newValues: ['title' => 'Test Course'],
        );

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'course_created',
            'auditable_type' => 'App\\Models\\Course',
            'auditable_id' => 42,
        ]);
    }

    public function test_log_with_user_id(): void
    {
        AuditLogService::log(
            action: 'course_updated',
            auditableType: 'App\\Models\\Course',
            auditableId: 1,
            userId: 5,
            newValues: ['title' => 'Updated'],
        );

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'course_updated',
            'user_id' => 5,
        ]);
    }

    public function test_log_with_ip_and_user_agent(): void
    {
        AuditLogService::log(
            action: 'user_login',
            ip: '127.0.0.1',
            userAgent: 'TestAgent/1.0',
        );

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'user_login',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'TestAgent/1.0',
        ]);
    }

    public function test_log_with_old_values(): void
    {
        AuditLogService::log(
            action: 'role_changed',
            oldValues: ['role' => 'student'],
            newValues: ['role' => 'teacher'],
        );

        $log = AuditLog::latest()->first();
        $this->assertEquals(['role' => 'student'], $log->old_values);
        $this->assertEquals(['role' => 'teacher'], $log->new_values);
    }

    public function test_log_with_no_auditable(): void
    {
        AuditLogService::log(
            action: 'system_event',
            newValues: ['message' => 'System started'],
        );

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'system_event',
            'auditable_type' => null,
            'auditable_id' => null,
        ]);
    }

    public function test_get_recent_returns_recent_logs(): void
    {
        AuditLog::factory()->count(5)->create(['created_at' => now()->subDays(1)]);
        AuditLog::factory()->count(3)->create(['created_at' => now()]);

        $recent = AuditLogService::getRecent(7, 10);

        $this->assertCount(8, $recent);
    }

    public function test_get_recent_empty_when_no_logs(): void
    {
        $recent = AuditLogService::getRecent(7, 10);

        $this->assertCount(0, $recent);
    }
}
