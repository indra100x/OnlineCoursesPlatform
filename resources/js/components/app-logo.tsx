export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-11 items-center justify-center rounded-2xl bg-black text-white shadow-[0_14px_28px_rgba(17,17,17,0.14)] transition-shadow hover:shadow-[0_18px_34px_rgba(17,17,17,0.18)]">
                <svg viewBox="0 0 64 64" className="size-8" aria-hidden="true">
                    <rect x="4" y="4" width="56" height="56" rx="18" fill="#111111" />
                    <rect x="12" y="12" width="18" height="18" rx="7" fill="#FFD84D" />
                    <rect x="34" y="12" width="18" height="18" rx="7" fill="#2563EB" />
                    <rect x="12" y="34" width="18" height="18" rx="7" fill="#EF4444" />
                    <path d="M37 36h9c3.866 0 7 3.134 7 7v9H37V36Z" fill="white" />
                </svg>
            </div>
            <div className="ml-3 grid flex-1 text-left text-sm">
                <span className="truncate text-base font-black leading-tight text-black">
                    CourseAtlas
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.22em] text-black/55">Learning Platform</span>
            </div>
        </>
    );
}
