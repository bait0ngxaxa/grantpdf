import React from "react";
import { ChevronDown, FileText, FolderTree } from "lucide-react";
import { ProgramIdentityIcon } from "@/components/ProgramIdentityIcon";
import { getProgramAccent } from "@/components/programAccent";
import { cn } from "@/lib/shared/utils";

export interface ProgramGroupStat {
    label: string;
    icon?: React.ReactNode;
}

interface ProgramGroupHeaderProps {
    groupKey: string;
    label: string;
    stats: ProgramGroupStat[];
    isUngrouped: boolean;
    isExpanded: boolean;
    showChevron?: boolean;
    compact?: boolean;
}

const ungroupedIconClass =
    "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700";

function renderGroupIcon({
    groupKey,
    label,
    isUngrouped,
    compact,
}: Pick<
    ProgramGroupHeaderProps,
    "groupKey" | "label" | "isUngrouped" | "compact"
>): React.JSX.Element {
    const iconClass = compact ? "h-4 w-4" : "h-5 w-5";

    if (isUngrouped) {
        return <FolderTree className={iconClass} />;
    }

    const accent = getProgramAccent({ id: groupKey, name: label });
    return <ProgramIdentityIcon accentKey={accent.key} className={iconClass} />;
}

function ProgramGroupStats({
    stats,
}: {
    stats: ProgramGroupStat[];
}): React.JSX.Element {
    return (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {stats.map((stat) => (
                <span
                    key={stat.label}
                    className="inline-flex items-center rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-700"
                >
                    {stat.icon ?? null}
                    {stat.label}
                </span>
            ))}
        </div>
    );
}

function ProgramGroupChevron({
    isExpanded,
    compact,
}: Pick<
    ProgramGroupHeaderProps,
    "isExpanded" | "compact"
>): React.JSX.Element {
    return (
        <div
            className={cn(
                "self-end rounded-full bg-slate-50 p-2 text-slate-400 transition-transform duration-300 motion-reduce:transition-none dark:bg-slate-700 dark:text-slate-300 sm:self-auto",
                isExpanded && "rotate-180",
            )}
        >
            <ChevronDown className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>
    );
}

export function ProgramGroupHeader({
    groupKey,
    label,
    stats,
    isUngrouped,
    isExpanded,
    showChevron = true,
    compact = false,
}: ProgramGroupHeaderProps): React.JSX.Element {
    const accent = isUngrouped
        ? null
        : getProgramAccent({ id: groupKey, name: label });
    const iconBoxSize = compact ? "h-9 w-9 rounded-xl" : "h-12 w-12 rounded-2xl";
    const iconTone = accent?.icon ?? ungroupedIconClass;

    return (
        <>
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div
                    className={cn(
                        "flex flex-shrink-0 items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none",
                        iconBoxSize,
                        iconTone,
                    )}
                >
                    {renderGroupIcon({
                        groupKey,
                        label,
                        isUngrouped,
                        compact,
                    })}
                </div>
                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                        <span
                            className={cn(
                                "h-2 w-2 flex-shrink-0 rounded-full",
                                accent?.dot ?? "bg-slate-400",
                            )}
                        />
                        <h3
                            className={cn(
                                "font-bold break-words text-slate-900 dark:text-slate-100",
                                compact ? "text-sm" : "text-base sm:text-lg",
                            )}
                        >
                            {label}
                        </h3>
                    </div>
                    <ProgramGroupStats stats={stats} />
                </div>
            </div>
            {showChevron && (
                <ProgramGroupChevron
                    isExpanded={isExpanded}
                    compact={compact}
                />
            )}
        </>
    );
}

export function fileStatIcon(
    className = "mr-1.5 h-3.5 w-3.5",
): React.JSX.Element {
    return <FileText className={className} />;
}
