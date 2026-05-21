"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Skeleton } from "@/components/ui";
import { API_ROUTES, PAGINATION } from "@/lib/constants";
import { useSignedDownload } from "@/lib/hooks/useSignedDownload";
import type { AdminProject, AdminProjectReport } from "@/type";
import { FileText, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { ProjectReportItem } from "./ProjectReportItem";
import { useAdminDashboardContext } from "../../contexts";

interface ProjectReportsModalProps {
    isOpen: boolean;
    project: AdminProject | null;
    onClose: () => void;
}

interface ReportsResponse {
    reports: AdminProjectReport[];
}

interface UpdateReportResponse {
    report: AdminProjectReport;
    message?: string;
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

export const ProjectReportsModal: React.FC<ProjectReportsModalProps> = ({
    isOpen,
    project,
    onClose,
}) => {
    const [reports, setReports] = useState<AdminProjectReport[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
    const { download, isDownloading } = useSignedDownload();
    const { fetchProjects } = useAdminDashboardContext();

    const fetchReports = useCallback(async (): Promise<void> => {
        if (!project) return;
        const params = new URLSearchParams({
            projectId: project.id,
            page: "1",
            limit: PAGINATION.ITEMS_PER_PAGE.toString(),
        });
        setIsLoading(true);
        try {
            const response = await fetch(
                `${API_ROUTES.ADMIN_REPORTS}?${params.toString()}`,
            );
            const data: unknown = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(getErrorMessage(data, "ไม่สามารถโหลดรายงานได้"));
            }
            setReports((data as ReportsResponse).reports);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "ไม่สามารถโหลดรายงานได้";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [project]);

    useEffect(() => {
        if (!isOpen) return;

        const frameId = window.requestAnimationFrame(() => {
            void fetchReports();
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [fetchReports, isOpen]);

    const updateReport = async (
        reportId: string,
        status: string,
    ): Promise<void> => {
        setUpdatingReportId(reportId);
        try {
            const response = await fetch(API_ROUTES.ADMIN_REPORTS, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reportId,
                    status,
                    adminNote: adminNotes[reportId] || undefined,
                }),
            });
            const data: unknown = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(
                    getErrorMessage(data, "ไม่สามารถอัปเดตรายงานได้"),
                );
            }
            const result = data as UpdateReportResponse;
            setReports((current) =>
                current.map((report) =>
                    report.id === reportId ? result.report : report,
                ),
            );
            await fetchProjects();
            toast.success(result.message ?? "อัปเดตผลตรวจรายงานสำเร็จ");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "ไม่สามารถอัปเดตรายงานได้";
            toast.error(message);
        } finally {
            setUpdatingReportId(null);
        }
    };

    const changeAdminNote = (reportId: string, value: string): void => {
        setAdminNotes((current) => ({ ...current, [reportId]: value }));
    };

    const downloadReport = (fileId: string): void => {
        void download({ fileId, fromAdminPanel: true });
    };

    if (!isOpen || !project) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="ปิดหน้าต่างรายงานโครงการ"
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative z-10 flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-700">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-xl font-bold text-slate-800 dark:text-slate-100">
                                รายงานโครงการ
                            </h3>
                            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                {project.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void fetchReports()}
                            disabled={isLoading}
                            className="h-9 rounded-xl"
                        >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            รีเฟรช
                        </Button>
                        <button
                            type="button"
                            aria-label="ปิดหน้าต่างรายงานโครงการ"
                            onClick={onClose}
                            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-28 w-full rounded-2xl" />
                            <Skeleton className="h-28 w-full rounded-2xl" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-slate-600 dark:bg-slate-900/30">
                            <FileText className="h-10 w-10 text-slate-400" />
                            <h4 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
                                ยังไม่มีรายงานในโครงการนี้
                            </h4>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reports.map((report) => (
                                <ProjectReportItem
                                    key={report.id}
                                    report={report}
                                    adminNote={
                                        adminNotes[report.id] ??
                                        report.adminNote ??
                                        ""
                                    }
                                    isDownloading={isDownloading}
                                    isUpdating={updatingReportId === report.id}
                                    onAdminNoteChange={changeAdminNote}
                                    onDownload={downloadReport}
                                    onUpdate={(reportId, status) =>
                                        void updateReport(reportId, status)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
