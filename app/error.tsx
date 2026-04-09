"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

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
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col gap-4 p-8 text-center">
                    {/* Error Icon Animation */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    {/* Error Title */}
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-balance">
                        เกิดข้อผิดพลาด
                    </h2>

                    {/* Error Message */}
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        ระบบไม่สามารถโหลดหน้านี้ได้ในขณะนี้ กรุณาลองใหม่อีกครั้งหรือกลับหน้าหลัก
                    </p>

                    {/* Error Details (Development only) */}
                    {process.env.NODE_ENV === "development" &&
                        error.message && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm text-red-700 dark:text-red-300 font-mono break-all">
                                    {error.message}
                                </p>
                                {error.digest && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                                        Error ID: {error.digest}
                                    </p>
                                )}
                            </div>
                        )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => reset()}
                            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                        <button
                            onClick={() => (window.location.href = "/")}
                            className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                        >
                            กลับหน้าหลัก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
