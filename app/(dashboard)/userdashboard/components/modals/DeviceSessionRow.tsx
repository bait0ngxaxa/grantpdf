import React from "react";
import { Laptop, Loader2, MonitorSmartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeviceSessionStatus = "active" | "expired" | "revoked";

export type DeviceSession = {
    id: string;
    browser: string;
    os: string;
    deviceType: string;
    ip: string | null;
    createdAt: string;
    lastUsedAt: string | null;
    expiresAt: string;
    isCurrentSession: boolean;
    status: DeviceSessionStatus;
};

function formatDateTime(value: string | null): string {
    if (!value) return "ยังไม่มีข้อมูล";
    return new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function getStatusLabel(status: DeviceSessionStatus): string {
    if (status === "active") return "ใช้งานอยู่";
    if (status === "expired") return "หมดอายุ";
    return "ถูกออกจากระบบแล้ว";
}

function getStatusClass(status: DeviceSessionStatus): string {
    if (status === "active") {
        return "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300";
    }
    if (status === "expired") {
        return "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300";
    }
    return "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";
}

export function DeviceSessionRow({
    session,
    actionId,
    onCurrentLogout,
    onRevoke,
}: {
    session: DeviceSession;
    actionId: string | null;
    onCurrentLogout: () => Promise<void>;
    onRevoke: (sessionId: string) => Promise<void>;
}): React.JSX.Element {
    const isBusy = actionId === session.id;
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-300">
                    {session.deviceType === "เดสก์ท็อป" ? (
                        <Laptop className="h-4 w-4" />
                    ) : (
                        <MonitorSmartphone className="h-4 w-4" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {session.browser} · {session.os}
                        </p>
                        {session.isCurrentSession ? (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                อุปกรณ์นี้
                            </span>
                        ) : null}
                        <span
                            className={cn(
                                "rounded-full border px-2 py-0.5 text-[11px] font-bold",
                                getStatusClass(session.status),
                            )}
                        >
                            {getStatusLabel(session.status)}
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        ใช้งานล่าสุด:{" "}
                        {formatDateTime(session.lastUsedAt ?? session.createdAt)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        IP: {session.ip ?? "ไม่ทราบ"}
                    </p>
                </div>
            </div>
            <button
                type="button"
                onClick={() =>
                    void (session.isCurrentSession
                        ? onCurrentLogout()
                        : onRevoke(session.id))
                }
                disabled={isBusy || session.status !== "active"}
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-900/50 dark:hover:bg-red-950/20 dark:hover:text-red-300"
            >
                {isBusy ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : null}
                ออกจากระบบอุปกรณ์นี้
            </button>
        </div>
    );
}
