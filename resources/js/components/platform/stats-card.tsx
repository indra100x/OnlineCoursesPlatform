type StatsCardProps = {
    label: string;
    value: number | string;
    hint: string;
};

export function StatsCard({ label, value, hint }: StatsCardProps) {
    return (
        <div className="brand-surface brand-grid-fine relative overflow-hidden p-5">
            <div className="absolute -top-8 right-4 h-20 w-20 rounded-full bg-[#ffd84d]/60 blur-2xl" />
            <div className="absolute -bottom-8 left-0 h-20 w-20 rounded-full bg-[#2563eb]/10 blur-2xl" />
            <div className="absolute right-5 top-5 h-2.5 w-12 rounded-full bg-black/8" />
            <p className="relative text-sm font-medium uppercase tracking-[0.2em] text-black/45">
                {label}
            </p>
            <div className="relative mt-5 flex items-end justify-between gap-4">
                <p className="text-4xl font-black tracking-[-0.04em] text-black">{value}</p>
                <div className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    Live
                </div>
            </div>
            <p className="relative mt-3 max-w-[18rem] text-sm leading-6 text-black/60">{hint}</p>
        </div>
    );
}
