"use client";

import React from "react";
import { Button } from "@/components/ui";
import { REPORT_STATUS } from "@/lib/constants";
import { PROJECT_REPORT_NOTE_MAX_LENGTH } from "@/lib/validation/constants";
import { getReportStatusColor, getReportTypeColor } from "@/lib/utils";
import type { AdminProjectReport } from "@/type";
import { CheckCircle2, Download, Loader2 } from "lucide-react";

interface ProjectReportItemProps {
    report: AdminProjectReport;
    adminNote: string;
    isDownloading: boolean;
    isUpdating: boolean;
    onAdminNoteChange: (reportId: string, value: string) => void;
    onDownload: (fileId: string) => void;
    onUpdate: (reportId: string, status: string) => void;
}

export const ProjectReportItem: React.FC<ProjectReportItemProps> = ({
    report,
    adminNote,
    isDownloading,
    isUpdating,
    onAdminNoteChange,
    onDownload,
    onUpdate,
}) => {
    const canReview = report.status === REPORT_STATUS.PENDING_REVIEW;

    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/30">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_14rem_18rem]">
            <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getReportStatusColor(report.status)}`}
                    >
                        {report.status}
                    </span>
                    <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getReportTypeColor(report.reportType)}`}
                    >
                        {report.reportType}
                    </span>
                </div>
                <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                    {report.file.originalFileName}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    ผู้ส่ง: {report.userName} • {report.userEmail}
                </p>
                {report.note && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                        หมายเหตุผู้ส่ง: {report.note}
                    </p>
                )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
                <p>
                    ส่งเมื่อ:{" "}
                    {new Date(report.submittedAt).toLocaleString("th-TH")}
                </p>
                {report.reviewedAt && (
                    <p className="mt-1">
                        ตรวจเมื่อ:{" "}
                        {new Date(report.reviewedAt).toLocaleString("th-TH")}
                    </p>
                )}
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isDownloading}
                    onClick={() => onDownload(report.fileId)}
                    className="mt-3 h-8 rounded-xl px-3 text-xs"
                >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    ดาวน์โหลด
                </Button>
            </div>

            {canReview ? (
                <div className="space-y-2">
                    <textarea
                        value={adminNote}
                        maxLength={PROJECT_REPORT_NOTE_MAX_LENGTH}
                        onChange={(event) =>
                            onAdminNoteChange(report.id, event.target.value)
                        }
                        placeholder="หมายเหตุถึงผู้ส่งรายงาน"
                        className="h-20 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() =>
                                onUpdate(report.id, REPORT_STATUS.APPROVED)
                            }
                            className="h-8 rounded-xl bg-blue-600 px-3 text-xs text-white hover:bg-blue-700"
                        >
                            {isUpdating ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            อนุมัติ
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() =>
                                onUpdate(report.id, REPORT_STATUS.NEEDS_REVISION)
                            }
                            className="h-8 rounded-xl px-3 text-xs"
                        >
                            ให้แก้ไข
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">
                        หมายเหตุผู้ตรวจ
                    </p>
                    <p className="whitespace-pre-wrap">
                        {report.adminNote || "ไม่มีหมายเหตุ"}
                    </p>
                </div>
            )}
        </div>
    </div>
    );
};
