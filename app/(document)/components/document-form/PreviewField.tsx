"use client";

import { type ReactNode } from "react";
import { cn, formatNumericWithCommas } from "@/lib/utils";

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
    const shouldFormatCurrencyLike =
        /งบประมาณ|มูลค่า|ราคา|ค่าใช้จ่าย|จำนวนเงิน|ยอด|รวม|งวด/.test(label);
    const normalizedValue =
        value && shouldFormatCurrencyLike
            ? formatNumericWithCommas(value)
            : value;

    return (
        <div
            className={cn(
                "rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 px-4 py-3",
                className,
            )}
        >
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2 text-balance">
                {label}
            </h4>
            {children ? (
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed break-words">
                    {children}
                </div>
            ) : (
                <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50 break-words">
                    {normalizedValue || "-"}
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
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-3";

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
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 px-4 py-3">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2 text-balance">
                {label}
            </h4>
            {items.length > 0 ? (
                <ul className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50 list-disc list-inside space-y-1">
                    {items.map((item, index) => (
                        <li key={index}>
                            {item || `รายการที่ ${index + 1} (ยังไม่ได้กรอก)`}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    {emptyMessage}
                </p>
            )}
        </div>
    );
}
