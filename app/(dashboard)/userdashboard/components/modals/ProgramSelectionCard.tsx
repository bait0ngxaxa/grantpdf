import React from "react";
import { AlertCircle, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProgramSummary } from "@/type/models";
import { getProgramAccent } from "@/components/programAccent";
import { ProgramIdentityIcon } from "@/components/ProgramIdentityIcon";
import { cn } from "@/lib/utils";

export function ProgramSelectionCard({
    program,
    onSelect,
}: {
    program: ProgramSummary;
    onSelect: (programId: string) => void;
}): React.JSX.Element {
    const accent = getProgramAccent(program);
    return (
        <button
            type="button"
            disabled={!program.isActive}
            onClick={() => onSelect(program.id)}
            className={cn(
                "group relative flex min-h-24 cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition-[border-color,box-shadow,transform,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm motion-reduce:transition-none motion-reduce:transform-none",
                program.isActive && "hover:-translate-y-0.5 hover:shadow-md",
                accent.card,
                program.isActive && accent.hoverShadow,
            )}
        >
            <div
                className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none",
                    !program.isActive && "group-hover:scale-100",
                    accent.icon,
                )}
            >
                <ProgramIdentityIcon accentKey={accent.key} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
                    <p className="line-clamp-2 text-sm font-bold leading-5 text-slate-800 dark:text-slate-100">
                        {program.name}
                    </p>
                </div>
                {!program.isActive ? (
                    <span className="mt-1 inline-flex text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        ปิดใช้งาน
                    </span>
                ) : null}
                {program.description ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {program.description}
                    </p>
                ) : null}
            </div>
            <ChevronRight
                className={cn(
                    "mt-3 h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:transform-none",
                    !program.isActive && "group-hover:translate-x-0",
                    accent.text,
                )}
            />
        </button>
    );
}

export function SelectedProgramBadge({
    program,
    onChange,
}: {
    program: ProgramSummary;
    onChange: () => void;
}): React.JSX.Element {
    const accent = getProgramAccent(program);
    return (
        <div
            className={`flex items-center gap-3 rounded-2xl border px-3 py-3 shadow-sm ${accent.panel}`}
        >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${accent.icon}`}>
                <ProgramIdentityIcon accentKey={accent.key} className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className={`text-[11px] font-bold ${accent.text}`}>
                    โครงการหลักที่เลือก
                </p>
                <div className="flex min-w-0 items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                        {program.name}
                    </p>
                </div>
            </div>
            <button
                type="button"
                onClick={onChange}
                className={`inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/80 px-3 text-xs font-bold underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 dark:bg-slate-800/80 dark:focus-visible:ring-offset-slate-900 ${accent.text}`}
            >
                เปลี่ยน
            </button>
        </div>
    );
}

export function ProgramSelectionList({
    programs,
    isLoading,
    error,
    onRetry,
    onSelect,
}: {
    programs: ProgramSummary[];
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
    onSelect: (programId: string) => void;
}): React.JSX.Element {
    if (isLoading) {
        return (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500 motion-reduce:animate-none" />
                กำลังโหลดรายการโครงการหลัก
            </div>
        );
    }

    if (error) {
        return (
            <div
                role="alert"
                className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/70 px-4 text-center dark:border-red-900/40 dark:bg-red-950/20"
            >
                <AlertCircle className="h-9 w-9 text-red-500 dark:text-red-300" />
                <p className="mt-3 text-sm font-semibold text-red-800 dark:text-red-100">
                    โหลดรายการโครงการหลักไม่สำเร็จ
                </p>
                <p className="mt-1 max-w-sm break-words text-xs leading-5 text-red-700 dark:text-red-200">
                    {error}
                </p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="mt-4 h-9 rounded-lg text-xs font-bold"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    ลองโหลดอีกครั้ง
                </Button>
            </div>
        );
    }

    if (programs.length === 0) {
        return (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center dark:border-slate-700 dark:bg-slate-900/30">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    ยังไม่มีโครงการหลักให้เลือก
                </p>
                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                    กรุณาเพิ่มหรือเปิดใช้งานโครงการหลักก่อนสร้างโครงการใหม่
                </p>
            </div>
        );
    }

    return (
        <div className="-mx-1 grid max-h-[min(52dvh,420px)] grid-cols-1 gap-3 overflow-y-auto px-1 py-1 sm:grid-cols-2">
            {programs.map((program) => (
                <ProgramSelectionCard
                    key={program.id}
                    program={program}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
