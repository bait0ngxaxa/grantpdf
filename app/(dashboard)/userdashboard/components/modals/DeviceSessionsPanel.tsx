"use client";

import React from "react";
import { Loader2, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { signOutWithSessionRevoke } from "@/lib/client/auth";
import { cn } from "@/lib/shared/utils";
import {
    DeviceSessionRow,
    type DeviceSession,
} from "./DeviceSessionRow";

type SessionsResponse = {
    sessions: DeviceSession[];
};

type DeviceSessionsState = {
    sessions: DeviceSession[];
    isLoading: boolean;
    actionId: string | null;
    message: string | null;
    fetchSessions: () => Promise<void>;
    revokeSession: (sessionId: string) => Promise<void>;
    revokeOthers: () => Promise<void>;
};

function isSessionsResponse(value: unknown): value is SessionsResponse {
    return (
        typeof value === "object" &&
        value !== null &&
        "sessions" in value &&
        Array.isArray(value.sessions)
    );
}

async function parseErrorMessage(response: Response): Promise<string> {
    const data: unknown = await response.json().catch(() => null);
    if (typeof data === "object" && data !== null && "error" in data) {
        const error = data.error;
        if (typeof error === "string") return error;
    }
    return "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง";
}

async function requestDeviceSessions(): Promise<DeviceSession[]> {
    const response = await fetch("/api/auth/sessions", { method: "GET" });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok || !isSessionsResponse(data)) {
        throw new Error("ไม่สามารถโหลดข้อมูลอุปกรณ์ได้");
    }
    return data.sessions;
}

async function requestSessionRevoke(sessionId: string): Promise<void> {
    const response = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionFamilyId: sessionId }),
    });
    if (!response.ok) throw new Error(await parseErrorMessage(response));
}

async function requestOtherSessionsRevoke(): Promise<void> {
    const response = await fetch("/api/auth/sessions/revoke-others", {
        method: "POST",
    });
    if (!response.ok) throw new Error(await parseErrorMessage(response));
}

function useDeviceSessions(): DeviceSessionsState {
    const [sessions, setSessions] = React.useState<DeviceSession[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [actionId, setActionId] = React.useState<string | null>(null);
    const [message, setMessage] = React.useState<string | null>(null);

    const fetchSessions = React.useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setMessage(null);
        try {
            setSessions(await requestDeviceSessions());
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลอุปกรณ์ได้");
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        // The panel mounts only when the profile dialog opens, so this is the
        // boundary where the client synchronizes with the server session list.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchSessions();
    }, [fetchSessions]);

    const revokeSession = async (sessionId: string): Promise<void> => {
        setActionId(sessionId);
        setMessage(null);
        try {
            await requestSessionRevoke(sessionId);
            await fetchSessions();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "ไม่สามารถออกจากระบบได้");
        } finally {
            setActionId(null);
        }
    };

    const revokeOthers = async (): Promise<void> => {
        setActionId("others");
        setMessage(null);
        try {
            await requestOtherSessionsRevoke();
            await fetchSessions();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "ไม่สามารถออกจากระบบได้");
        } finally {
            setActionId(null);
        }
    };

    return {
        sessions,
        isLoading,
        actionId,
        message,
        fetchSessions,
        revokeSession,
        revokeOthers,
    };
}

export function DeviceSessionsPanel(): React.JSX.Element {
    const state = useDeviceSessions();

    return (
        <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
            <PanelHeader
                isLoading={state.isLoading}
                onRefresh={state.fetchSessions}
            />
            <PanelMessage message={state.message} />
            <SessionList state={state} />
            <PanelActions state={state} />
        </section>
    );
}

function PanelHeader({
    isLoading,
    onRefresh,
}: {
    isLoading: boolean;
    onRefresh: () => Promise<void>;
}): React.JSX.Element {
    return (
        <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-300">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        ข้อมูลเซสชัน
                    </h3>
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                        ตรวจสอบอุปกรณ์ที่ยังเข้าสู่ระบบบัญชีนี้
                    </p>
                </div>
            </div>
            <button
                type="button"
                onClick={() => void onRefresh()}
                disabled={isLoading}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                aria-label="รีเฟรชรายการอุปกรณ์"
            >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </button>
        </div>
    );
}

function PanelMessage({ message }: { message: string | null }): React.JSX.Element | null {
    if (!message) return null;
    return (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            {message}
        </p>
    );
}

function SessionList({ state }: { state: DeviceSessionsState }): React.JSX.Element {
    return (
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {state.isLoading && state.sessions.length === 0 ? <SessionsLoading /> : null}
            {state.sessions.map((session) => (
                <DeviceSessionRow
                    key={session.id}
                    session={session}
                    actionId={state.actionId}
                    onCurrentLogout={signOutWithSessionRevoke}
                    onRevoke={state.revokeSession}
                />
            ))}
        </div>
    );
}

function SessionsLoading(): React.JSX.Element {
    return (
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-4 text-xs text-slate-500 dark:bg-slate-700/50 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังโหลดรายการอุปกรณ์
        </div>
    );
}

function PanelActions({ state }: { state: DeviceSessionsState }): React.JSX.Element {
    return (
        <div className="flex flex-col gap-2 sm:flex-row">
            <Button
                type="button"
                variant="outline"
                onClick={() => void state.revokeOthers()}
                disabled={state.actionId !== null || state.sessions.length <= 1}
                className="h-11 flex-1 rounded-xl border-slate-200 text-xs text-slate-700 hover:bg-slate-50 sm:h-9 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
                {state.actionId === "others" ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                )}
                ออกจากระบบอุปกรณ์อื่นทั้งหมด
            </Button>
        </div>
    );
}
