import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
    children: ReactNode;
    fallback?: ReactNode;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[400px] items-center justify-center p-8">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-black">Something went wrong</h2>
                        <p className="mt-2 text-sm text-black/60">
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            type="button"
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
