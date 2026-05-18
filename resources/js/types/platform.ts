export type Role = 'admin' | 'teacher' | 'student';

export type PlatformUser = {
    id: number;
    name: string;
    email: string;
    role?: Role;
    avatar_path?: string | null;
    bio?: string | null;
    created_at: string;
    updated_at?: string;
};

export type Teacher = Pick<PlatformUser, 'id' | 'name' | 'email' | 'avatar_path' | 'bio'>;
export type PublicStudent = Pick<PlatformUser, 'id' | 'name' | 'email' | 'avatar_path' | 'bio' | 'created_at'>;

export type Chapter = {
    id: number;
    course_id: number;
    title: string;
    position: number;
    file_path: string;
    file_name: string;
    file_size: number | null;
    created_at: string;
};

export type CourseRating = {
    id: number;
    student_id: number;
    course_id: number;
    rating: number;
    review: string | null;
    created_at: string;
    student?: Pick<PlatformUser, 'id' | 'name' | 'avatar_path'>;
};

export type Course = {
    id: number;
    title: string;
    description: string;
    price: string;
    teacher_id?: number;
    enrollment_code: string | null;
    teacher?: Teacher;
    chapters?: Chapter[];
    ratings?: CourseRating[];
    chapters_count?: number;
    enrollments_count?: number;
    ratings_count?: number;
    ratings_avg_rating?: number | null;
    is_purchased?: boolean;
    is_wishlisted?: boolean;
    is_enrolled?: boolean;
    created_at: string;
    enrolled_at?: string;
};

export type StudentCourse = Course & {
    teacher: Teacher;
};

export type Profile = {
    id: number;
    name: string;
    email: string;
    role: Role;
    bio: string | null;
    avatar_path: string | null;
    created_at: string;
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

export type TeacherProfileView = {
    teacher: Teacher & Pick<PlatformUser, 'created_at'>;
    courses: Course[];
};

export type StudentProfileView = {
    student: PublicStudent;
    courses: Course[];
};

export type TeacherRequestItem = {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    proof_link: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
};
