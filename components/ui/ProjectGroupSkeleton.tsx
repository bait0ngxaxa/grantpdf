import { cn } from "@/lib/shared/utils";
import { Skeleton } from "./Skeleton";

interface ProjectGroupSkeletonProps {
    compact?: boolean;
    rows?: number;
    className?: string;
}

const ROW_KEYS = [1, 2, 3] as const;

function visibleRows(rows: number): readonly number[] {
    const count = Math.min(Math.max(rows, 1), ROW_KEYS.length);
    return ROW_KEYS.slice(0, count);
}

function ProjectRowSkeleton({
    compact = false,
}: {
    compact?: boolean;
}): React.JSX.Element {
    if (compact) {
        return (
            <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                        <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <Skeleton className="h-3.5 w-4/5 max-w-72" />
                            <Skeleton className="h-3 w-3/5 max-w-56" />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pl-[42px]">
                        <Skeleton className="h-3 w-16 rounded-full" />
                        <Skeleton className="h-3 w-20 rounded-full" />
                        <Skeleton className="ml-auto h-6 w-24 rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="@container rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm sm:px-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="grid min-w-0 gap-3 @4xl:grid-cols-[minmax(0,1fr)_auto] @4xl:items-start @6xl:grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)_auto] @6xl:items-center">
                <div className="min-w-0 @4xl:col-start-1 @4xl:row-start-1 @6xl:col-auto @6xl:row-auto">
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-4 w-4/5 max-w-80" />
                            <Skeleton className="h-3 w-3/5 max-w-64" />
                            <Skeleton className="h-5 w-32 rounded-full" />
                        </div>
                    </div>
                </div>
                <div className="grid min-w-0 gap-2 @4xl:col-start-1 @4xl:row-start-2 @6xl:col-auto @6xl:row-auto @6xl:grid-cols-[minmax(7.5rem,9rem)_minmax(12rem,15rem)] @6xl:items-center">
                    <Skeleton className="h-7 w-32 rounded-full @6xl:justify-self-center" />
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1">
                        <Skeleton className="h-3.5 w-16 rounded-full" />
                        <Skeleton className="h-3.5 w-16 rounded-full" />
                        <Skeleton className="h-3.5 w-24 rounded-full" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 @4xl:col-start-2 @4xl:row-span-2 @4xl:row-start-1 @4xl:self-start sm:flex sm:flex-wrap sm:justify-end @6xl:col-auto @6xl:row-auto @6xl:flex-nowrap @6xl:self-center">
                    <Skeleton className="h-11 rounded-lg sm:h-8 sm:w-16 sm:shrink-0" />
                    <Skeleton className="h-11 rounded-lg sm:h-8 sm:w-16 sm:shrink-0" />
                    <Skeleton className="col-span-2 h-11 rounded-lg sm:col-span-1 sm:h-8 sm:w-28 sm:shrink-0" />
                    <div className="col-span-2 flex justify-end gap-1 border-t border-slate-100 pt-2 sm:col-span-1 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-2 dark:border-slate-700">
                        <Skeleton className="h-11 w-11 rounded-lg sm:h-8 sm:w-8" />
                        <Skeleton className="h-11 w-11 rounded-lg sm:h-8 sm:w-8" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ProjectGroupSkeleton({
    compact = false,
    rows = 2,
    className,
}: ProjectGroupSkeletonProps): React.JSX.Element {
    return (
        <div
            className={cn(
                "min-w-0 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800",
                compact && "rounded-2xl",
                className,
            )}
        >
            <div
                className={cn(
                    "flex w-full flex-col items-start justify-between gap-4 bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6 dark:bg-slate-800",
                    compact && "gap-3 px-3 py-3 sm:px-3",
                )}
            >
                <div className="flex min-w-0 items-start gap-3">
                    <Skeleton
                        className={cn(
                            "h-10 w-10 shrink-0 rounded-xl",
                            compact && "h-8 w-8 rounded-lg",
                        )}
                    />
                    <div className="min-w-0 space-y-2">
                        <Skeleton className="h-4 w-52 max-w-full" />
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-5 w-28 rounded-full" />
                            <Skeleton className="h-5 w-24 rounded-full" />
                        </div>
                    </div>
                </div>
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            </div>

            <div
                className={cn(
                    "space-y-3 bg-slate-50/60 p-4 sm:p-5 dark:bg-slate-900/40",
                    compact && "space-y-2 p-3 sm:p-3",
                )}
            >
                {visibleRows(rows).map((row) => (
                    <ProjectRowSkeleton key={row} compact={compact} />
                ))}
            </div>
        </div>
    );
}
