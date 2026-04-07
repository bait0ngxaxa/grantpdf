"use client";

import React from "react";
import { useAuditLogs } from "../../hooks";
import { Pagination, Skeleton } from "@/components/ui";
import { Search, ShieldAlert, XCircle } from "lucide-react";
import {
    ACTION_OPTIONS,
    formatAuditDateTime,
    formatAuditDetails,
    getActionLabel,
} from "./auditLogFormatters";

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
                    className="alert alert-error bg-red-50 border border-red-200 text-red-800 rounded-2xl"
                >
                    <XCircle className="stroke-current shrink-0 h-6 w-6" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-balance">
                            Audit Logs
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            บันทึกเหตุการณ์สำคัญของระบบ ({total} รายการ)
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ค้นหา action/อีเมล/target…"
                            className="pl-10 pr-3 py-2.5 w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    <select
                        value={filters.action}
                        onChange={(e) => setAction(e.target.value)}
                        className="px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
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
                            setOutcome(e.target.value as "" | "success" | "failure")
                        }
                        className="px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                    >
                        <option value="">ทุกผลลัพธ์</option>
                        <option value="success">สำเร็จ</option>
                        <option value="failure">ล้มเหลว</option>
                    </select>

                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setDate(e.target.value)}
                        className="px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {isLoading && logs.length === 0 ? (
                    <div className="p-6 space-y-3">
                        <Skeleton className="h-12 rounded-xl" />
                        <Skeleton className="h-12 rounded-xl" />
                        <Skeleton className="h-12 rounded-xl" />
                        <Skeleton className="h-12 rounded-xl" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-slate-50/50 dark:bg-slate-700/50">
                                <tr className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                                    <th className="px-4 py-3 text-left">เวลา</th>
                                    <th className="px-4 py-3 text-left">Action</th>
                                    <th className="px-4 py-3 text-left">ผลลัพธ์</th>
                                    <th className="px-4 py-3 text-left">ผู้กระทำ</th>
                                    <th className="px-4 py-3 text-left">เป้าหมาย</th>
                                    <th className="px-4 py-3 text-left">รายละเอียด</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
                                        >
                                            ไม่พบข้อมูล Audit Logs
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40"
                                        >
                                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                {formatAuditDateTime(log.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                                {getActionLabel(log.action)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={
                                                        log.outcome === "success"
                                                            ? "inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                                            : "inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                                    }
                                                >
                                                    {log.outcome}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                                                <div>{log.actorEmail || "-"}</div>
                                                <div className="text-[11px] text-slate-400">
                                                    ID: {log.actorUserId || "-"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                                                {log.targetType || "-"} / {log.targetId || "-"}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate"
                                                title={JSON.stringify(log.details)}
                                            >
                                                {formatAuditDetails(log.action, log.details)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end">
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
