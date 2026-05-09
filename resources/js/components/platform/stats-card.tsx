type StatsCardProps = {
    label: string;
    value: number | string;
    hint: string;
};

export function StatsCard({ label, value, hint }: StatsCardProps) {
    return (
        <div className="rounded-3xl border border-red-600 bg-gradient-to-br from-red-600/20 to-blue-600/20 p-5 backdrop-blur-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-200">
                {label}
            </p>
            <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-sm text-gray-200">{hint}</p>
        </div>
    );
}
