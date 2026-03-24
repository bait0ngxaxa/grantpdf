"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PreviewFieldProps {
    label: string;
    value?: string | null;
    children?: ReactNode;
    className?: string;
}

export function PreviewField({
    label,
    value,
    children,
    className = "",
}: PreviewFieldProps): React.JSX.Element {
    return (
        <div className={className}>
            <h4 className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 text-balance">
                {label}
            </h4>
            {children ? (
                children
            ) : (
                <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    {value || "-"}
                </p>
            )}
        </div>
    );
}

interface PreviewGridProps {
    columns?: 1 | 2 | 3;
    children: ReactNode;
}

export function PreviewGrid({
    columns = 2,
    children,
}: PreviewGridProps): React.JSX.Element {
    const gridClass =
        columns === 1
            ? "grid-cols-1"
            : columns === 2
              ? "grid-cols-2"
              : "grid-cols-3";

    return <div className={cn("grid gap-4", gridClass)}>{children}</div>;
}

interface PreviewListProps {
    label: string;
    items: string[];
    emptyMessage?: string;
}

export function PreviewList({
    label,
    items,
    emptyMessage = "ไม่มีข้อมูล",
}: PreviewListProps): React.JSX.Element {
    return (
        <div>
            <h4 className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2 text-balance">
                {label}
            </h4>
            {items.length > 0 ? (
                <ul className="text-base font-semibold text-slate-800 dark:text-slate-100 list-disc list-inside space-y-1">
                    {items.map((item, index) => (
                        <li key={index}>
                            {item || `รายการที่ ${index + 1} (ยังไม่ได้กรอก)`}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                    {emptyMessage}
                </p>
            )}
        </div>
    );
}
