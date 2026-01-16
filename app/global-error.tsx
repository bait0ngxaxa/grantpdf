"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}): React.JSX.Element {
    return (
        <html lang="th">
            <body className="bg-gray-100 dark:bg-gray-900">
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
                        <div className="p-8 text-center">
                            {/* Critical Error Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                                </div>
                            </div>

                            {/* Error Title */}
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                ข้อผิดพลาดร้ายแรง
                            </h1>

                            {/* Error Message */}
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                เกิดข้อผิดพลาดที่ไม่คาดคิดในระบบ
                                กรุณาลองใหม่อีกครั้ง
                            </p>

                            {/* Error ID */}
                            {error.digest && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">
                                    รหัสข้อผิดพลาด: {error.digest}
                                </p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => reset()}
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                    ลองใหม่อีกครั้ง
                                </button>
                                <button
                                    onClick={() => (window.location.href = "/")}
                                    className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                >
                                    กลับหน้าหลัก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
