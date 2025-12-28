'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onRetry?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

/**
 * Client-side error boundary component
 * Catches JavaScript errors in child component tree and displays a fallback UI
 * Does not expose stack traces or sensitive data
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development only
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
        this.props.onRetry?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center px-4 py-8 max-w-md">
                        <div className="mx-auto w-16 h-16 bg-error-soft rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-dark mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-500 mb-6">
                            We encountered an unexpected error. Please try again.
                        </p>
                        <Button onClick={this.handleRetry}>
                            Try Again
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Wrapper component for use in Server Components
 * Provides a simple error boundary wrapper
 */
export function ErrorBoundaryWrapper({
    children,
    onRetry
}: {
    children: ReactNode;
    onRetry?: () => void;
}) {
    return (
        <ErrorBoundary onRetry={onRetry}>
            {children}
        </ErrorBoundary>
    );
}

/**
 * Simple error display component (for use outside error boundaries)
 */
interface ErrorDisplayProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    showRetry?: boolean;
}

export function ErrorDisplay({
    title = 'Something went wrong',
    message = 'We encountered an unexpected error. Please try again.',
    onRetry,
    showRetry = true
}: ErrorDisplayProps) {
    return (
        <div className="text-center px-4 py-16">
            <div className="mx-auto w-16 h-16 bg-error-soft rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-xl font-semibold text-dark mb-2">{title}</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
            {showRetry && onRetry && (
                <Button onClick={onRetry}>Try Again</Button>
            )}
        </div>
    );
}
