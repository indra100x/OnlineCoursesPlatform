type StatsCardProps = {
    label: string;
    value: number | string;
    hint: string;
};

export function StatsCard({ label, value, hint }: StatsCardProps) {
    return (
        <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                {label}
            </p>
            <p className="mt-4 text-4xl font-semibold text-slate-900">{value}</p>
            <p className="mt-2 text-sm text-slate-600">{hint}</p>
        </div>
    );
}
