"use client";

import React, { useEffect, useCallback, useState } from "react";
import { File, X, Loader2 } from "lucide-react";

interface PdfPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    previewUrl: string;
    previewFileName: string;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
    isOpen,
    onClose,
    previewUrl,
    previewFileName,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [prevUrl, setPrevUrl] = useState(previewUrl);

    // React-recommended pattern: adjust state during render when URL changes
    if (previewUrl && previewUrl !== prevUrl) {
        setPrevUrl(previewUrl);
        setIsLoading(true);
        setHasError(false);
    }

    // Close on Escape key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose],
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative z-10 w-full max-w-6xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 px-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 z-10 flex-shrink-0">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-500 dark:text-red-400 flex-shrink-0">
                            <File className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate text-balance">
                            {previewFileName}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="ปิด"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-0 relative">
                    {/* Loading overlay */}
                    {isLoading && !hasError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 z-10">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                                กำลังโหลดเอกสาร…
                            </p>
                        </div>
                    )}

                    {/* Error fallback */}
                    {hasError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 z-10">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                                <X className="h-8 w-8 text-red-500" />
                            </div>
                            <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                                ไม่สามารถโหลดเอกสารได้
                            </p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                ไฟล์อาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง
                            </p>
                        </div>
                    )}

                    {/* iframe */}
                    <iframe
                        src={previewUrl}
                        width="100%"
                        height="100%"
                        style={{ border: "none" }}
                        title="PDF Preview"
                        className="w-full h-full"
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setHasError(true);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
