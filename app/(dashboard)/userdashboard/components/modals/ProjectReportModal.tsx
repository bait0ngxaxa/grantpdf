"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    FILE_UPLOAD,
    REPORT_STATUS,
    REPORT_TYPES,
    getMaxUploadSizeBytesByFileName,
    getMaxUploadSizeMbByFileName,
} from "@/lib/constants";
import { PROJECT_REPORT_NOTE_MAX_LENGTH } from "@/lib/validation/constants";
import { getReportStatusColor, getReportTypeColor } from "@/lib/utils";
import type { Project, ProjectReport } from "@/type";
import { FileText, FileUp, Loader2, MessageSquareText, X } from "lucide-react";
import { toast } from "sonner";

interface ProjectReportModalProps {
    isOpen: boolean;
    project: Project | null;
    onClose: () => void;
}

interface ReportsResponse {
    reports: ProjectReport[];
}

interface SubmitReportResponse {
    report: ProjectReport;
    message?: string;
}

const REPORT_TYPE_OPTIONS = [
    REPORT_TYPES.PROGRESS,
    REPORT_TYPES.FINAL,
] as const;

const ADMIN_NOTE_STYLE_BY_STATUS: Record<string, string> = {
    [REPORT_STATUS.APPROVED]:
        "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-100 [&_.admin-note-title]:text-emerald-800 dark:[&_.admin-note-title]:text-emerald-200",
    [REPORT_STATUS.NEEDS_REVISION]:
        "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-100 [&_.admin-note-title]:text-rose-800 dark:[&_.admin-note-title]:text-rose-200",
};

const DEFAULT_ADMIN_NOTE_STYLE =
    "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100 [&_.admin-note-title]:text-blue-800 dark:[&_.admin-note-title]:text-blue-200";

function getApiUrl(projectId: string): string {
    return `/api/projects/${encodeURIComponent(projectId)}/reports`;
}

function getErrorMessage(value: unknown, fallback: string): string {
    if (
        typeof value === "object" &&
        value !== null &&
        "error" in value &&
        typeof (value as { error?: unknown }).error === "string"
    ) {
        return (value as { error: string }).error;
    }
    return fallback;
}

export const ProjectReportModal: React.FC<ProjectReportModalProps> = ({
    isOpen,
    project,
    onClose,
}) => {
    const [reportType, setReportType] = useState<string>(REPORT_TYPES.PROGRESS);
    const [note, setNote] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [reports, setReports] = useState<ProjectReport[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = (): void => {
        setReportType(REPORT_TYPES.PROGRESS);
        setNote("");
        setFile(null);
        setFileError(null);
    };

    const fetchReports = useCallback(async (): Promise<void> => {
        if (!project) return;
        setIsLoading(true);
        try {
            const response = await fetch(getApiUrl(project.id));
            const data: unknown = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(
                    getErrorMessage(data, "ไม่สามารถโหลดรายงานโครงการได้"),
                );
            }
            setReports((data as ReportsResponse).reports);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "ไม่สามารถโหลดรายงานโครงการได้";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [project]);

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            if (!isOpen) {
                resetForm();
                return;
            }

            void fetchReports();
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [fetchReports, isOpen]);

    const handleSubmit = async (): Promise<void> => {
        if (!project || !file || fileError) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("reportType", reportType);
            formData.append("note", note);
            formData.append("file", file);

            const response = await fetch(getApiUrl(project.id), {
                method: "POST",
                body: formData,
            });
            const data: unknown = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(getErrorMessage(data, "ไม่สามารถส่งรายงานได้"));
            }

            const result = data as SubmitReportResponse;
            setReports((current) => [result.report, ...current]);
            resetForm();
            toast.success(result.message ?? "ส่งรายงานโครงการสำเร็จ");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "ไม่สามารถส่งรายงานได้";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = (): void => {
        if (isSubmitting) return;
        onClose();
    };

    const validateSelectedFile = (selectedFile: File): string | null => {
        const fileName = selectedFile.name.toLowerCase();
        const isAllowedExtension = FILE_UPLOAD.ALLOWED_EXTENSIONS.some(
            (ext) => fileName.endsWith(ext),
        );

        if (!isAllowedExtension) {
            return `รองรับเฉพาะไฟล์: ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(", ")}`;
        }

        const maxSizeBytes = getMaxUploadSizeBytesByFileName(selectedFile.name);
        const maxSizeMb = getMaxUploadSizeMbByFileName(selectedFile.name);
        if (selectedFile.size > maxSizeBytes) {
            return `ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxSizeMb}MB)`;
        }

        return null;
    };

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ): void => {
        const selectedFile = event.target.files?.[0] ?? null;
        if (!selectedFile) {
            setFile(null);
            setFileError(null);
            return;
        }

        const validationError = validateSelectedFile(selectedFile);
        if (validationError) {
            setFile(null);
            setFileError(validationError);
            event.target.value = "";
            toast.error(validationError);
            return;
        }

        setFile(selectedFile);
        setFileError(null);
    };

    const accept = FILE_UPLOAD.ALLOWED_EXTENSIONS.join(",");

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-0 bg-white p-6 shadow-2xl sm:max-w-[680px] dark:bg-slate-800">
                <DialogHeader>
                    <div className="mb-2 flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                            <FileUp className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            ส่งรายงานโครงการ
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                        {project?.name ?? "เลือกโครงการเพื่อส่งรายงาน"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                ประเภทรายงาน
                            </label>
                            <select
                                value={reportType}
                                onChange={(event) =>
                                    setReportType(event.target.value)
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                            >
                                {REPORT_TYPE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                ไฟล์รายงาน
                            </label>
                            <label className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 px-3 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300">
                                <span className="truncate">
                                    {file?.name ?? "เลือกไฟล์รายงาน"}
                                </span>
                                <FileUp className="h-4 w-4 shrink-0" />
                                <input
                                    type="file"
                                    accept={accept}
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />
                            </label>
                            {fileError && (
                                <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                                    {fileError}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            หมายเหตุ{" "}
                            <span className="font-normal text-slate-500">
                                (ไม่บังคับ)
                            </span>
                        </label>
                        <textarea
                            value={note}
                            maxLength={PROJECT_REPORT_NOTE_MAX_LENGTH}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="ระบุรายละเอียดเพิ่มเติมถึงผู้ตรวจรายงาน"
                            className="h-24 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                        />
                        <p className="mt-2 text-right text-xs text-slate-500 dark:text-slate-400">
                            {note.length}/{PROJECT_REPORT_NOTE_MAX_LENGTH}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                ประวัติการส่งรายงาน
                            </h3>
                            {isLoading && (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            )}
                        </div>
                        {reports.length === 0 && !isLoading ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                ยังไม่มีการส่งรายงานสำหรับโครงการนี้
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {reports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="rounded-xl bg-white px-3 py-2 dark:bg-slate-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getReportTypeColor(report.reportType)}`}
                                                    >
                                                        {report.reportType}
                                                    </span>
                                                    <span
                                                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getReportStatusColor(report.status)}`}
                                                    >
                                                        {report.status}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(
                                                        report.submittedAt,
                                                    ).toLocaleDateString("th-TH")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 grid min-w-0 gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 sm:grid-cols-2">
                                            <div className="flex min-w-0 items-start gap-2">
                                                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                                                        ไฟล์ที่ส่ง
                                                    </p>
                                                    <p
                                                        className="mt-1 break-words leading-5"
                                                        title={
                                                            report.file
                                                                .originalFileName
                                                        }
                                                    >
                                                        {
                                                            report.file
                                                                .originalFileName
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex min-w-0 items-start gap-2">
                                                <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                                                        หมายเหตุผู้ส่ง
                                                    </p>
                                                    <p className="mt-1 whitespace-pre-wrap break-words leading-5">
                                                        {report.note ||
                                                            "ไม่มีหมายเหตุ"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {report.adminNote && (
                                            <div
                                                className={`mt-2 rounded-xl border px-3 py-2.5 text-xs shadow-sm ${
                                                    ADMIN_NOTE_STYLE_BY_STATUS[
                                                        report.status
                                                    ] ??
                                                    DEFAULT_ADMIN_NOTE_STYLE
                                                }`}
                                            >
                                                <p className="admin-note-title font-bold">
                                                    หมายเหตุผู้ตรวจ
                                                </p>
                                                <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium leading-6">
                                                    {report.adminNote}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="h-11 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                    >
                        <X className="mr-2 h-4 w-4" />
                        ยกเลิก
                    </Button>
                    <Button
                        type="button"
                        onClick={() => void handleSubmit()}
                        disabled={!file || Boolean(fileError) || isSubmitting || !project}
                        className="h-11 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" />
                                กำลังส่งรายงาน…
                            </>
                        ) : (
                            <>
                                <FileUp className="mr-2 h-4 w-4" />
                                ส่งรายงาน
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
