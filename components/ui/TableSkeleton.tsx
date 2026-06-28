import { cn } from "@/lib/shared/utils";
import { Skeleton } from "./Skeleton";

interface TableSkeletonProps {
    columns?: number;
    rows?: number;
    className?: string;
    withFooter?: boolean;
    withToolbar?: boolean;
}

const COLUMN_KEYS = [1, 2, 3, 4, 5, 6] as const;
const ROW_KEYS = [1, 2, 3, 4, 5] as const;

function takeKeys(keys: readonly number[], count: number): readonly number[] {
    return keys.slice(0, Math.min(Math.max(count, 1), keys.length));
}

export function TableSkeleton({
    columns = 6,
    rows = 4,
    className,
    withFooter = true,
    withToolbar = false,
}: TableSkeletonProps): React.JSX.Element {
    const visibleColumns = takeKeys(COLUMN_KEYS, columns);
    const visibleRows = takeKeys(ROW_KEYS, rows);

    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:rounded-3xl dark:border-slate-700 dark:bg-slate-800",
                className,
            )}
        >
            {withToolbar && (
                <div className="border-b border-slate-100 p-4 sm:p-6 dark:border-slate-700">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-44" />
                            <Skeleton className="h-4 w-64 max-w-full" />
                        </div>
                        <Skeleton className="h-11 w-full rounded-xl sm:w-80" />
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[48rem]">
                    <thead className="bg-slate-50/50 dark:bg-slate-700/50">
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                            {visibleColumns.map((column) => (
                                <th key={column} className="px-4 py-3 sm:px-6">
                                    <Skeleton className="h-3.5 w-16 rounded-full" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {visibleRows.map((row) => (
                            <tr key={row}>
                                {visibleColumns.map((column) => (
                                    <td
                                        key={column}
                                        className="px-4 py-3 sm:px-6 sm:py-4"
                                    >
                                        <Skeleton
                                            className={cn(
                                                "h-4 rounded-full",
                                                column === 1 && "w-14",
                                                column === 2 && "w-36",
                                                column === 3 && "w-48",
                                                column === 4 && "w-20",
                                                column === 5 && "w-24",
                                                column === 6 && "w-16",
                                            )}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {withFooter && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 p-4 sm:flex-row dark:border-slate-700">
                    <Skeleton className="h-4 w-44" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <Skeleton className="h-9 w-20 rounded-lg" />
                        <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                </div>
            )}
        </div>
    );
}
