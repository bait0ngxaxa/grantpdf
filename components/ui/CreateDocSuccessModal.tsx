"use client";

import React, { useEffect, useRef } from "react";
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui";
import { FileText, CheckCircle2 } from "lucide-react";

interface CreateDocSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    downloadUrl: string | null;
    documentType?: string;
    onRedirect?: () => void; // Optional callback to run BEFORE redirect (e.g., allowNavigation)
}

export const CreateDocSuccessModal: React.FC<CreateDocSuccessModalProps> = ({
    isOpen,
    onClose,
    fileName,
    downloadUrl: _downloadUrl,
    documentType = "เอกสาร",
    onRedirect,
}): React.JSX.Element => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isRedirectingRef = useRef(false);
    const onRedirectRef = useRef(onRedirect);

    // Update ref when onRedirect changes
    useEffect(() => {
        onRedirectRef.current = onRedirect;
    }, [onRedirect]);

    const downloadFileName = ((): string => {
        if (!fileName || fileName.trim() === "") {
            if (documentType?.includes("Excel")) {
                return "document.xlsx";
            } else {
                return "document.docx";
            }
        }

        if (fileName.includes(".")) {
            return fileName;
        }

        if (documentType?.includes("Excel")) {
            return `${fileName}.xlsx`;
        } else {
            return `${fileName}.docx`;
        }
    })();

    const handleRedirect = (): void => {
        if (isRedirectingRef.current) return;
        isRedirectingRef.current = true;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        onClose();

        // Call onRedirect callback first (e.g., to call allowNavigation)
        if (onRedirectRef.current) {
            onRedirectRef.current();
        }

        // Always use window.location for guaranteed redirect
        window.location.href = "/userdashboard";
    };

    // Auto-redirect after 3 seconds
    useEffect(() => {
        if (isOpen && !isRedirectingRef.current) {
            timerRef.current = setTimeout(() => {
                handleRedirect();
            }, 3000);
        }

        return (): void => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            isRedirectingRef.current = false;
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-0 shadow-2xl focus:outline-none">
                <div className="flex flex-col items-center text-center p-2">
                    {/* Success Icon with Animation */}
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 ring-4 ring-green-50 dark:ring-green-900/30 animate-in zoom-in-50 duration-300">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <DialogTitle className="font-bold text-2xl mb-3 text-center text-slate-800 dark:text-slate-100">
                        สร้าง{documentType}สำเร็จ!
                    </DialogTitle>

                    <DialogDescription
                        className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed w-full"
                        asChild
                    >
                        <div>
                            <p className="mb-4">
                                {documentType}ของคุณถูกสร้างเรียบร้อยแล้ว
                            </p>

                            {/* File Card info */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3 text-left w-full shadow-sm mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                                        {downloadFileName}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        พร้อมดาวน์โหลด
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 animate-pulse">
                                กำลังนำทางไปยังหน้าหลักอัตโนมัติภายใน 3
                                วินาที...
                            </p>
                        </div>
                    </DialogDescription>

                    <div className="flex flex-col space-y-3 w-full">
                        <Button
                            onClick={handleRedirect}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-200 dark:shadow-none h-12 text-base font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            กลับไปหน้าหลัก
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
