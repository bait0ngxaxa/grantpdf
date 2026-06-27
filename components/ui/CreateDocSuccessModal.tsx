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
import { ROUTES } from "@/lib/constants";

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
        window.location.href = ROUTES.DASHBOARD;
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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-2xl border border-slate-100 bg-white p-4 focus:outline-none sm:max-w-md sm:p-6 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col items-center text-center p-2">
                    {/* Success Icon with Animation */}
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600 ring-4 ring-green-50 motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-900/30">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <DialogTitle className="mb-3 break-words text-center text-2xl font-bold text-slate-800 dark:text-slate-100">
                        สร้าง{documentType}สำเร็จ!
                    </DialogTitle>

                    <DialogDescription
                        className="mb-8 w-full break-words leading-relaxed text-slate-500 dark:text-slate-400"
                        asChild
                    >
                        <div>
                            <p className="mb-4">
                                {documentType}ของคุณถูกสร้างเรียบร้อยแล้ว
                            </p>

                            {/* File Card info */}
                            <div className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left dark:border-slate-700 dark:bg-slate-800/50">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p
                                        className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200"
                                        title={downloadFileName}
                                    >
                                        {downloadFileName}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        พร้อมดาวน์โหลด
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 motion-safe:animate-pulse">
                                กำลังนำทางไปยังหน้าหลักอัตโนมัติภายใน 3
                                วินาที…
                            </p>
                        </div>
                    </DialogDescription>

                    <div className="flex flex-col space-y-3 w-full">
                        <Button
                            onClick={handleRedirect}
                            className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            กลับไปหน้าหลัก
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
