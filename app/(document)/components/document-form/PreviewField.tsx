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
            <h4 className="mb-2 text-xs font-semibold text-slate-600 text-balance dark:text-slate-300">
                {label}
            </h4>
            {children ? (
                <div className="overflow-x-auto whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-100">
                    {children}
                </div>
            ) : (
                <p className="whitespace-pre-wrap break-words text-sm font-semibold text-slate-900 md:text-base dark:text-slate-50">
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
            <h4 className="mb-2 text-xs font-semibold text-slate-600 text-balance dark:text-slate-300">
                {label}
            </h4>
            {items.length > 0 ? (
                <ul className="list-inside list-disc space-y-1 break-words text-sm font-semibold text-slate-900 md:text-base dark:text-slate-50">
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
