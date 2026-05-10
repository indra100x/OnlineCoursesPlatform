type EmptyStateProps = {
    title: string;
    description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <div className="brand-surface brand-grid p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-black text-[10px] font-black uppercase tracking-[0.22em] text-white">
                New
            </div>
            <h3 className="text-base font-semibold text-black">{title}</h3>
            <p className="mt-1.5 text-xs text-black/55">{description}</p>
        </div>
    );
}
