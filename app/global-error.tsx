"use client";

import { ErrorState } from "@/components/ui";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}): React.JSX.Element {
    return (
        <html lang="th">
            <body className="bg-slate-100 dark:bg-slate-900">
                <ErrorState
                    headingLevel="h1"
                    className="min-h-screen"
                    title="ข้อผิดพลาดร้ายแรง"
                    description="เกิดข้อผิดพลาดที่ไม่คาดคิดในระบบ กรุณาลองใหม่อีกครั้ง"
                    onRetry={reset}
                >
                    {error.digest ? (
                        <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
                            รหัสข้อผิดพลาด: {error.digest}
                        </p>
                    ) : null}
                </ErrorState>
            </body>
        </html>
    );
}
