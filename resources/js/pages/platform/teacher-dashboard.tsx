import { Plus } from 'lucide-react';
import { EmptyState } from '@/components/platform/empty-state';
import { ErrorMessage } from '@/components/platform/error-message';
import { StatsCard } from '@/components/platform/stats-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeacherData } from '@/hooks/use-teacher-data';
import { CourseHeader } from './components/course-header';
import { EnrolledStudents } from './components/enrolled-students';
import { TeacherCourseList } from './components/teacher-course-list';

export default function TeacherDashboard() {
    const {
        courses,
        selectedCourse,
        setSelectedCourse,
        students,
        courseForm,
        setCourseForm,
        chapterForm,
        setChapterForm,
        error,
        loading,
        handleCreateCourse,
        handleDeleteCourse,
        handleAddChapter,
    } = useTeacherData();

    return (
        <div className="space-y-5">
            <section className="grid gap-4 sm:grid-cols-4">
                <StatsCard label="Courses" value={courses.length} hint="Published courses" />
                <StatsCard
                    label="Catalog value"
                    value={`$${courses.reduce((total, course) => total + Number(course.price || 0), 0).toFixed(0)}`}
                    hint="Total price across courses"
                />
                <StatsCard
                    label="Students"
                    value={courses.reduce((total, course) => total + (course.enrollments_count ?? 0), 0)}
                    hint="Current enrollments"
                    variant="blue"
                />
                <StatsCard
                    label="Ratings"
                    value={courses.reduce((total, course) => total + (course.ratings_count ?? 0), 0)}
                    hint="Feedback entries"
                    variant="accent"
                />
            </section>

            <section className="grid gap-5 xl:grid-cols-[380px,1fr]">
                <div className="space-y-5">
                    <div className="brand-surface p-5">
                        <h2 className="text-base font-semibold text-black">Launch a course</h2>
                        <p className="mt-0.5 text-xs text-black/50">Add a price, shape the offer, and prepare it for student purchases.</p>

                        <form className="mt-4 space-y-3.5" onSubmit={handleCreateCourse}>
                            <div className="space-y-1.5">
                                <Label htmlFor="course-title" className="text-xs font-semibold">Title</Label>
                                <Input
                                    id="course-title"
                                    value={courseForm.title}
                                    onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="course-price" className="text-xs font-semibold">Price</Label>
                                <Input
                                    id="course-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={courseForm.price}
                                    onChange={(event) => setCourseForm((current) => ({ ...current, price: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="course-description" className="text-xs font-semibold">Description</Label>
                                <textarea
                                    id="course-description"
                                    className="min-h-28 w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/30 outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                                    value={courseForm.description}
                                    onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))}
                                    required
                                />
                            </div>
                            <Button type="submit" className="rounded-xl bg-black text-white hover:bg-black/90">
                                <Plus className="size-4" />
                                Create course
                            </Button>
                        </form>
                    </div>

                    <TeacherCourseList
                        courses={courses}
                        selectedCourseId={selectedCourse?.id ?? null}
                        onSelect={setSelectedCourse}
                        loading={loading}
                    />
                </div>

                <div className="space-y-5">
                    {selectedCourse ? (
                        <>
                            <CourseHeader course={selectedCourse} onDelete={handleDeleteCourse} />

                            <div className="brand-surface p-5">
                                <h3 className="text-base font-semibold text-black">Add PDF Chapter</h3>
                                <p className="mt-0.5 text-xs text-black/50">Upload a PDF chapter and trigger student notifications.</p>

                                <form className="mt-4 space-y-3.5" onSubmit={handleAddChapter}>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="chapter-title" className="text-xs font-semibold">Chapter title</Label>
                                        <Input
                                            id="chapter-title"
                                            value={chapterForm.title}
                                            onChange={(event) => setChapterForm((current) => ({ ...current, title: event.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="chapter-file" className="text-xs font-semibold">PDF file</Label>
                                        <Input
                                            id="chapter-file"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(event) =>
                                                setChapterForm((current) => ({
                                                    ...current,
                                                    file: event.target.files?.[0] ?? null,
                                                }))
                                            }
                                            required
                                        />
                                    </div>

                                    {error ? <ErrorMessage message={error} /> : null}

                                    <Button type="submit" className="rounded-xl bg-black text-white hover:bg-black/90">
                                        <Plus className="size-4" />
                                        Create chapter
                                    </Button>
                                </form>
                            </div>

                            <EnrolledStudents students={students} />
                        </>
                    ) : (
                        <EmptyState title="Pick a course" description="Select a course from the left to manage pricing, PDF chapters, and enrolled students." />
                    )}
                </div>
            </section>
        </div>
    );
}
