import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    message?: string;
    className?: string;
}

export function LoadingSpinner({
    message = "กำลังโหลด...",
    className = "",
}: LoadingSpinnerProps) {
    return (
        <div className={`flex items-center justify-center py-12 ${className}`}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {message && (
                <span className="ml-4 text-gray-600 dark:text-gray-400">
                    {message}
                </span>
            )}
        </div>
    );
}
