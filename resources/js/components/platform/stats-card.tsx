type StatsCardVariant = 'default' | 'blue' | 'accent';

type StatsCardProps = {
    label: string;
    value: number | string;
    hint: string;
    variant?: StatsCardVariant;
};

const variantClasses: Record<StatsCardVariant, string> = {
    default: 'brand-surface',
    blue: 'brand-surface-blue',
    accent: 'brand-surface-accent',
};

const labelClasses: Record<StatsCardVariant, string> = {
    default: 'brand-kicker',
    blue: 'text-xs font-semibold uppercase tracking-[0.22em] text-white/60',
    accent: 'text-xs font-semibold uppercase tracking-[0.22em] text-black/55',
};

const valueClasses: Record<StatsCardVariant, string> = {
    default: 'text-3xl font-black text-black',
    blue: 'text-3xl font-black text-white',
    accent: 'text-3xl font-black text-black',
};

const hintClasses: Record<StatsCardVariant, string> = {
    default: 'mt-1 text-sm text-black/50',
    blue: 'mt-1 text-sm text-white/65',
    accent: 'mt-1 text-sm text-black/55',
};

export function StatsCard({
    label,
    value,
    hint,
    variant = 'default',
}: StatsCardProps) {
    return (
        <div className={`${variantClasses[variant]} p-5`}>
            <p className={labelClasses[variant]}>{label}</p>
            <p className={`mt-2 ${valueClasses[variant]}`}>{value}</p>
            <p className={hintClasses[variant]}>{hint}</p>
        </div>
    );
}
