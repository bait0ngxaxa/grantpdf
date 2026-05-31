import React from "react";
import { ChevronRight } from "lucide-react";
import type { ProgramSummary } from "@/type/models";
import { getProgramAccent } from "@/components/programAccent";
import { ProgramIdentityIcon } from "@/components/ProgramIdentityIcon";

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
            onClick={() => onSelect(program.id)}
            className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${accent.card} ${accent.hoverShadow}`}
        >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105 ${accent.icon}`}>
                <ProgramIdentityIcon accentKey={accent.key} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                        {program.name}
                    </p>
                </div>
                {!program.isActive ? (
                    <span className="mt-1 inline-flex text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        ปิดใช้งาน
                    </span>
                ) : null}
                {program.description ? (
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {program.description}
                    </p>
                ) : null}
            </div>
            <ChevronRight className={`mt-3 h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 ${accent.text}`} />
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
        <div className={`flex items-center gap-3 rounded-2xl border px-3 py-3 shadow-sm ${accent.panel}`}>
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
                className={`shrink-0 cursor-pointer rounded-full bg-white/80 px-3 py-1 text-xs font-bold underline-offset-2 hover:underline dark:bg-slate-800/80 ${accent.text}`}
            >
                เปลี่ยน
            </button>
        </div>
    );
}
