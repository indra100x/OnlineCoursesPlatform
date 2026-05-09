export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="truncate font-bold text-white leading-tight">
                    CourseHub
                </span>
                <span className="text-xs text-white">Learn & Teach</span>
            </div>
        </>
    );
}
