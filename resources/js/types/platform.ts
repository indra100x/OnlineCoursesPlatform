export type Role = 'admin' | 'teacher' | 'student';

export type PlatformUser = {
    id: number;
    name: string;
    email: string;
    role: Role;
    created_at: string;
    updated_at?: string;
};

export type Teacher = Pick<PlatformUser, 'id' | 'name' | 'email'>;

export type Chapter = {
    id: number;
    course_id: number;
    title: string;
    position: number;
    content_type: 'text' | 'video' | 'file';
    content: string | null;
    video_url: string | null;
    file_path: string | null;
    file_name: string | null;
    created_at: string;
};

export type Course = {
    id: number;
    title: string;
    description: string;
    teacher_id: number;
    enrollment_code: string;
    teacher?: Teacher;
    chapters?: Chapter[];
    chapters_count?: number;
    enrollments_count?: number;
    created_at: string;
};

export type StudentCourse = Course & {
    teacher: Teacher;
};

export type PlatformNotification = {
    id: number;
    user_id: number;
    course_id: number | null;
    chapter_id: number | null;
    type: 'chapter_created';
    data: {
        course_title?: string;
        chapter_title?: string;
        chapter_position?: number;
    } | null;
    message: string;
    is_read: boolean;
    created_at: string;
    course?: Pick<Course, 'id' | 'title'>;
    chapter?: Pick<Chapter, 'id' | 'title'>;
};
