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
    getFileExtension,
    getMaxUploadSizeBytesByFileName,
    getMaxUploadSizeMbByFileName,
} from "@/lib/shared/constants";
import {
    createUploadIdempotencyKey,
    fetchWithUploadRetry,
} from "@/lib/upload/clientRequest";
import { PROJECT_REPORT_NOTE_MAX_LENGTH } from "@/lib/validation/constants";
import { getReportStatusColor, getReportTypeColor } from "@/lib/shared/utils";
import type { Project, ProjectReport } from "@/type";
import {
    CheckCircle2,
    FileText,
    FileUp,
    Loader2,
    MessageSquareText,
    X,
} from "lucide-react";
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

const BYTE_UNIT = 1024;
const MB_UNIT = BYTE_UNIT * BYTE_UNIT;

function getApiUrl(projectId: string): string {
    return `/api/projects/${encodeURIComponent(projectId)}/reports`;
}

function formatFileSize(size: number): string {
    if (size >= MB_UNIT) {
        return `${(size / MB_UNIT).toFixed(2)} MB`;
    }

    if (size >= BYTE_UNIT) {
        return `${(size / BYTE_UNIT).toFixed(1)} KB`;
    }

    return `${size} ไบต์`;
}

function formatFileDate(timestamp: number): string {
    return new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(timestamp));
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

            const response = await fetchWithUploadRetry(
                getApiUrl(project.id),
                { method: "POST", body: formData },
                createUploadIdempotencyKey(),
            );
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
    const selectedFileExtension = file ? getFileExtension(file.name) : "";

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="overflow-y-auto rounded-2xl border border-slate-100 bg-white p-4 sm:max-w-[680px] sm:p-6 dark:border-slate-700 dark:bg-slate-800">
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
                    </div>

                    <div>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                ไฟล์รายงาน
                            </label>
                        </div>
                        <label className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-500/70 dark:hover:bg-blue-950/20">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-blue-100 p-2 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/40 dark:text-blue-300">
                                    <FileUp className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                                        {file ? "เปลี่ยนไฟล์รายงาน" : "เลือกไฟล์รายงาน"}
                                    </p>
                                    <p className="mt-1 break-words text-xs leading-5 text-slate-500 dark:text-slate-400">
                                        รองรับ {FILE_UPLOAD.ALLOWED_EXTENSIONS.join(", ")}
                                    </p>
                                </div>
                            </div>
                            <input
                                type="file"
                                accept={accept}
                                onChange={handleFileChange}
                                className="sr-only"
                            />
                        </label>

                        {file && (
                            <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-100">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-white p-2 text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-300">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                พร้อมส่ง
                                            </span>
                                            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {selectedFileExtension
                                                    ? selectedFileExtension.toUpperCase()
                                                    : "ไม่พบนามสกุลไฟล์"}
                                            </span>
                                        </div>
                                        <p
                                            className="mt-2 break-words text-sm font-semibold leading-5 text-slate-800 dark:text-slate-100"
                                            title={file.name}
                                        >
                                            {file.name}
                                        </p>
                                        <dl className="mt-3 grid gap-2 text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                                            <div>
                                                <dt className="font-semibold">
                                                    ขนาดไฟล์
                                                </dt>
                                                <dd>{formatFileSize(file.size)}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-semibold">
                                                    แก้ไขล่าสุด
                                                </dt>
                                                <dd>{formatFileDate(file.lastModified)}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        )}

                        {fileError && (
                            <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                                {fileError}
                            </p>
                        )}
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

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                    ประวัติการส่งรายงาน
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    {reports.length > 0
                                        ? `${reports.length} รายการล่าสุด`
                                        : "ยังไม่มีรายการ"}
                                </p>
                            </div>
                            {isLoading && (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            )}
                        </div>

                        {reports.length === 0 && !isLoading ? (
                            <div className="px-4 py-6 text-center">
                                <FileText className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                                    ยังไม่มีการส่งรายงานสำหรับโครงการนี้
                                </p>
                            </div>
                        ) : (
                            <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                                {reports.map((report, index) => (
                                    <li
                                        key={report.id}
                                        className="grid gap-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)]"
                                    >
                                        <div className="flex items-start gap-3 sm:block">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-900/50">
                                                {index + 1}
                                            </div>
                                        </div>

                                        <div className="min-w-0 space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getReportTypeColor(report.reportType)}`}
                                                    >
                                                        {report.reportType}
                                                    </span>
                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getReportStatusColor(report.status)}`}
                                                    >
                                                        {report.status}
                                                    </span>
                                                </div>
                                                <time className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    {new Date(
                                                        report.submittedAt,
                                                    ).toLocaleDateString("th-TH")}
                                                </time>
                                            </div>

                                            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                                                <div className="flex min-w-0 items-start gap-2.5">
                                                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                            ไฟล์ที่ส่ง
                                                        </p>
                                                        <p
                                                            className="mt-1 break-words text-sm leading-6 text-slate-700 dark:text-slate-200"
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
                                            </div>

                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <div className="rounded-xl border border-slate-100 px-3 py-3 dark:border-slate-700">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                                                        <MessageSquareText className="h-4 w-4 text-slate-400" />
                                                        หมายเหตุผู้ส่ง
                                                    </div>
                                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                        {report.note || "ไม่มีหมายเหตุ"}
                                                    </p>
                                                </div>

                                                <div
                                                    className={`rounded-xl border px-3 py-3 ${
                                                        report.adminNote
                                                            ? ADMIN_NOTE_STYLE_BY_STATUS[
                                                                  report.status
                                                              ] ??
                                                              DEFAULT_ADMIN_NOTE_STYLE
                                                            : "border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
                                                    }`}
                                                >
                                                    <p className="admin-note-title text-xs font-bold">
                                                        หมายเหตุผู้ตรวจ
                                                    </p>
                                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-6">
                                                        {report.adminNote ||
                                                            "รอผู้ตรวจระบุหมายเหตุ"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
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
