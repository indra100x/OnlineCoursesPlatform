type ErrorMessageProps = {
    message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
            {message}
        </p>
    );
}
