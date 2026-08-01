"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}): React.JSX.Element {
    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            console.error("Application Error:", error);
        }
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900">
            <ErrorState
                headingLevel="h1"
                title="เกิดข้อผิดพลาด"
                description="ระบบไม่สามารถโหลดหน้านี้ได้ในขณะนี้ กรุณาลองใหม่อีกครั้งหรือกลับหน้าหลัก"
                onRetry={reset}
            >
                {process.env.NODE_ENV === "development" && error.message ? (
                    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-800 dark:bg-red-900/20">
                        <p className="break-all font-mono text-sm text-red-700 dark:text-red-300">
                            {error.message}
                        </p>
                        {error.digest ? (
                            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
                                Error ID: {error.digest}
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </ErrorState>
        </div>
    );
}
