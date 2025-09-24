'use client';

interface LoadingSpinnerProps {
    message?: string;
}

export default function LoadingSpinner({ message = "กำลังโหลด..." }: LoadingSpinnerProps) {
    return (
        <div className="flex items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{message}</span>
        </div>
    );
}