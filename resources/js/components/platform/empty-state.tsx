type EmptyStateProps = {
    title: string;
    description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <div className="brand-surface brand-grid p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-xs font-black uppercase tracking-[0.22em] text-white">
                New
            </div>
            <h3 className="text-lg font-semibold text-black">{title}</h3>
            <p className="mt-2 text-sm text-black/60">{description}</p>
        </div>
    );
}
