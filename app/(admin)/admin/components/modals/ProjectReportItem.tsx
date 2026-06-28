"use client";

import React from "react";
import { Button } from "@/components/ui";
import { REPORT_STATUS } from "@/lib/shared/constants";
import { PROJECT_REPORT_NOTE_MAX_LENGTH } from "@/lib/validation/constants";
import { getReportStatusColor, getReportTypeColor } from "@/lib/shared/utils";
import type { AdminProjectReport } from "@/type";
import {
    CalendarClock,
    CheckCircle2,
    Download,
    FileText,
    Loader2,
    MessageSquareText,
    UserRound,
} from "lucide-react";

interface ProjectReportItemProps {
    report: AdminProjectReport;
    sequence: number;
    adminNote: string;
    isDownloading: boolean;
    isUpdating: boolean;
    onAdminNoteChange: (reportId: string, value: string) => void;
    onDownload: (fileId: string) => void;
    onUpdate: (reportId: string, status: string) => void;
}

export const ProjectReportItem: React.FC<ProjectReportItemProps> = ({
    report,
    sequence,
    adminNote,
    isDownloading,
    isUpdating,
    onAdminNoteChange,
    onDownload,
    onUpdate,
}) => {
    const canReview = report.status === REPORT_STATUS.PENDING_REVIEW;

    return (
        <li className="grid gap-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)]">
            <div className="flex items-start gap-3 sm:block">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-700 ring-1 ring-orange-100 dark:bg-orange-950/35 dark:text-orange-200 dark:ring-orange-900/50">
                    {sequence}
                </div>
            </div>

            <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
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
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {new Date(report.submittedAt).toLocaleString("th-TH")}
                    </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    ไฟล์รายงาน
                                </p>
                                <p
                                    className="mt-1 break-words text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100"
                                    title={report.file.originalFileName}
                                >
                                    {report.file.originalFileName}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isDownloading}
                            onClick={() => onDownload(report.fileId)}
                            className="h-8 shrink-0 rounded-xl px-3 text-xs"
                        >
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            ดาวน์โหลด
                        </Button>
                    </div>
                </div>

                <div className="grid gap-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 px-3 py-3 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                            <UserRound className="h-4 w-4 text-slate-400" />
                            ผู้ส่ง
                        </div>
                        <p className="mt-2 break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {report.userName}
                        </p>
                        <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
                            {report.userEmail}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 px-3 py-3 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                            <MessageSquareText className="h-4 w-4 text-slate-400" />
                            หมายเหตุผู้ส่ง
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {report.note || "ไม่มีหมายเหตุ"}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 px-3 py-3 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            สถานะการตรวจ
                        </p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            {report.reviewedAt
                                ? `ตรวจเมื่อ ${new Date(
                                      report.reviewedAt,
                                  ).toLocaleString("th-TH")}`
                                : "ยังไม่ได้ตรวจ"}
                        </p>
                    </div>
                </div>

                {canReview ? (
                    <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 dark:border-orange-900/40 dark:bg-orange-950/15">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            หมายเหตุถึงผู้ส่งรายงาน
                        </label>
                        <textarea
                            value={adminNote}
                            maxLength={PROJECT_REPORT_NOTE_MAX_LENGTH}
                            onChange={(event) =>
                                onAdminNoteChange(report.id, event.target.value)
                            }
                            placeholder="ระบุเหตุผลหรือคำแนะนำก่อนอนุมัติ/ให้แก้ไข"
                            className="mt-2 h-20 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 outline-none transition-colors focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
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
                                    onUpdate(
                                        report.id,
                                        REPORT_STATUS.NEEDS_REVISION,
                                    )
                                }
                                className="h-8 rounded-xl px-3 text-xs"
                            >
                                ให้แก้ไข
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            หมายเหตุผู้ตรวจ
                        </p>
                        <p className="mt-2 whitespace-pre-wrap break-words leading-6">
                            {report.adminNote || "ไม่มีหมายเหตุ"}
                        </p>
                    </div>
                )}
            </div>
        </li>
    );
};
