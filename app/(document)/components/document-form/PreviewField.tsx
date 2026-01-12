"use client";

import { ReactNode } from "react";

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
}: PreviewFieldProps) {
    return (
        <div className={className}>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                {label}
            </h4>
            {children ? (
                children
            ) : (
                <p className="text-base font-semibold text-slate-800">
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

export function PreviewGrid({ columns = 2, children }: PreviewGridProps) {
    const gridClass =
        columns === 1
            ? "grid-cols-1"
            : columns === 2
            ? "grid-cols-2"
            : "grid-cols-3";

    return <div className={`grid ${gridClass} gap-4`}>{children}</div>;
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
}: PreviewListProps) {
    return (
        <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                {label}
            </h4>
            {items.length > 0 ? (
                <ul className="text-base font-semibold text-slate-800 list-disc list-inside space-y-1">
                    {items.map((item, index) => (
                        <li key={index}>
                            {item || `รายการที่ ${index + 1} (ยังไม่ได้กรอก)`}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-400 italic">{emptyMessage}</p>
            )}
        </div>
    );
}
