import React from "react";
import {
    ProgramGroupHeader,
    type ProgramGroupStat,
} from "./ProgramGroupHeader";
import { cn } from "@/lib/shared/utils";

export interface ProgramGroupAccordionProps {
    groupKey: string;
    label: string;
    stats: ProgramGroupStat[];
    isUngrouped: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    className?: string;
    triggerClassName?: string;
    showChevron?: boolean;
    compact?: boolean;
}

export function ProgramGroupAccordion({
    groupKey,
    label,
    stats,
    isUngrouped,
    isExpanded,
    onToggle,
    children,
    className,
    triggerClassName,
    showChevron = true,
    compact = false,
}: ProgramGroupAccordionProps): React.JSX.Element {
    const triggerId = `program-trigger-${groupKey}`;
    const panelId = `program-panel-${groupKey}`;

    return (
        <div className={className}>
            <button
                id={triggerId}
                type="button"
                onClick={onToggle}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                className={triggerClassName}
            >
                <ProgramGroupHeader
                    groupKey={groupKey}
                    label={label}
                    isUngrouped={isUngrouped}
                    isExpanded={isExpanded}
                    showChevron={showChevron}
                    compact={compact}
                    stats={stats}
                />
            </button>

            <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className={cn(
                    "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                    isExpanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                )}
            >
                <div
                    className={cn(
                        "min-h-0 overflow-hidden transition-transform duration-300 ease-out motion-reduce:transition-none",
                        isExpanded ? "translate-y-0" : "-translate-y-1",
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
