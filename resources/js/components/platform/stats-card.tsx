type StatsCardProps = {
    label: string;
    value: number | string;
    hint: string;
};

export function StatsCard({ label, value, hint }: StatsCardProps) {
    return (
        <div className="brand-surface brand-grid-fine relative overflow-hidden p-5">
            <div className="absolute -top-8 right-4 h-20 w-20 rounded-full bg-[#ffd84d]/50 blur-2xl" />
            <div className="absolute -bottom-8 left-0 h-20 w-20 rounded-full bg-[#2563eb]/8 blur-2xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                {label}
            </p>
            <div className="relative mt-4 flex items-end justify-between gap-4">
                <p className="text-3xl font-black tracking-[-0.04em] text-black">{value}</p>
                <div className="rounded-full bg-black/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    Live
                </div>
            </div>
            <p className="relative mt-2 max-w-[18rem] text-xs leading-relaxed text-black/55">{hint}</p>
        </div>
    );
}
