"use client";

import React from "react";
import { useAuditLogs } from "../../hooks";
import { Pagination, TableSkeleton } from "@/components/ui";
import { Search, ShieldAlert, XCircle } from "lucide-react";
import {
    ACTION_OPTIONS,
    formatAuditDateTime,
    formatAuditDetails,
    getActionLabel,
} from "./auditLogFormatters";

interface AuditDetailsCellProps {
    action: string;
    details: Record<string, unknown> | null;
}

function AuditDetailsCell({
    action,
    details,
}: AuditDetailsCellProps): React.JSX.Element {
    return (
        <span className="block max-w-[34rem] min-w-[18rem] leading-5 break-words whitespace-normal">
            {formatAuditDetails(action, details)}
        </span>
    );
}

export function AuditLogsTab(): React.JSX.Element {
    const {
        logs,
        total,
        totalPages,
        page,
        isLoading,
        errorMessage,
        filters,
        setPage,
        setSearch,
        setAction,
        setOutcome,
        setDate,
    } = useAuditLogs();

    return (
        <div className="space-y-6">
            {errorMessage && (
                <div
                    role="alert"
                    className="alert alert-error rounded-2xl border border-red-200 bg-red-50 text-red-800"
                >
                    <XCircle className="h-6 w-6 shrink-0 stroke-current" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-balance text-slate-800 dark:text-slate-100">
                            บันทึกการใช้ระบบ
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            บันทึกเหตุการณ์สำคัญของระบบ ({total} รายการ)
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ค้นหา action/อีเมล/target…"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-10 text-sm text-slate-900 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                        />
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    <select
                        value={filters.action}
                        onChange={(e) => setAction(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    >
                        {ACTION_OPTIONS.map((action) => (
                            <option key={action || "all"} value={action}>
                                {action ? getActionLabel(action) : "ทุก Action"}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.outcome}
                        onChange={(e) =>
                            setOutcome(
                                e.target.value as "" | "success" | "failure",
                            )
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    >
                        <option value="">ทุกผลลัพธ์</option>
                        <option value="success">สำเร็จ</option>
                        <option value="failure">ล้มเหลว</option>
                    </select>

                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                {isLoading && logs.length === 0 ? (
                    <TableSkeleton
                        columns={6}
                        rows={4}
                        withFooter={false}
                        className="rounded-none border-0 shadow-none"
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-slate-50/50 dark:bg-slate-700/50">
                                <tr className="border-b border-slate-100 text-xs font-bold tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
                                    <th className="px-4 py-3 text-left">
                                        เวลา
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Action
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        ผลลัพธ์
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        ผู้กระทำ
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        เป้าหมาย
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        รายละเอียด
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
                                        >
                                            ไม่พบข้อมูลบันทึกการใช้ระบบ
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40"
                                        >
                                            <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                {formatAuditDateTime(
                                                    log.created_at,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap text-slate-800 dark:text-slate-100">
                                                {getActionLabel(log.action)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={
                                                        log.outcome ===
                                                        "success"
                                                            ? "inline-flex rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                                            : "inline-flex rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                                    }
                                                >
                                                    {log.outcome}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                                                <div>
                                                    {log.actorEmail || "-"}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    ID: {log.actorUserId || "-"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                                                {log.targetType || "-"} /{" "}
                                                {log.targetId || "-"}
                                            </td>
                                            <td className="px-4 py-3 align-top text-xs text-slate-500 dark:text-slate-400">
                                                <AuditDetailsCell
                                                    action={log.action}
                                                    details={log.details}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex items-center justify-end border-t border-slate-100 p-4 dark:border-slate-700">
                    <Pagination
                        currentPage={page}
                        totalPages={Math.max(totalPages, 1)}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </div>
    );
}
