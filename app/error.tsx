"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to error reporting service (optional)
        // You can integrate with services like Sentry here
        if (process.env.NODE_ENV === "development") {
            console.error("Application Error:", error);
        }
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="card w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
                <div className="card-body p-8 text-center">
                    {/* Error Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-red-600 dark:text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Error Title */}
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        เกิดข้อผิดพลาด
                    </h2>

                    {/* Error Message */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองอีกครั้ง
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
                            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        >
                            กลับหน้าหลัก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
