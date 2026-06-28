import { cn } from "@/lib/shared/utils";
import { Skeleton } from "./Skeleton";

type DashboardSkeletonVariant = "user" | "admin";

interface DashboardSkeletonProps {
    compact?: boolean;
    className?: string;
    variant?: DashboardSkeletonVariant;
}

const USER_STAT_KEYS = [1, 2, 3] as const;
const ADMIN_STAT_KEYS = [1, 2, 3, 4] as const;
const ACTION_KEYS = [1, 2] as const;
const ROW_KEYS = [1, 2, 3] as const;

function StatCardSkeleton({
    detailed = false,
}: {
    detailed?: boolean;
}): React.JSX.Element {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <Skeleton className="absolute inset-x-0 top-0 h-px rounded-none" />
            <div className="relative z-10 flex min-w-0 items-start gap-3.5">
                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-36 max-w-full" />
                    {detailed && (
                        <div className="grid gap-1.5 pt-1">
                            <Skeleton className="h-5 w-full rounded-lg" />
                            <Skeleton className="h-5 w-4/5 rounded-lg" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ActionCardSkeleton(): React.JSX.Element {
    return (
        <div className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900/80">
            <Skeleton className="absolute inset-x-0 top-0 h-px rounded-none" />
            <div className="relative z-10 flex items-center gap-3">
                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                <Skeleton className="h-5 w-44 max-w-full" />
            </div>
            <div className="relative z-10 mt-3 space-y-2 sm:pl-14">
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="h-4 w-3/5 max-w-72" />
            </div>
            <Skeleton className="relative z-10 mt-5 h-11 w-full rounded-xl sm:ml-14 sm:w-52" />
        </div>
    );
}

function SecondaryPanelSkeleton(): React.JSX.Element {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-3.5 w-56 max-w-full" />
                </div>
            </div>
            <div className="space-y-3">
                {ROW_KEYS.map((row) => (
                    <div
                        key={row}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/70 px-3 py-2.5 dark:bg-slate-800/70"
                    >
                        <Skeleton className="h-4 w-36 max-w-full" />
                        <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function CompactTabSkeleton(): React.JSX.Element {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white/95 p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/95">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <Skeleton className="h-11 w-full rounded-xl lg:w-96" />
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Skeleton className="h-11 w-full rounded-xl sm:w-36" />
                        <Skeleton className="h-11 w-full rounded-xl sm:w-40" />
                        <Skeleton className="h-11 w-full rounded-xl sm:w-36" />
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                        <Skeleton className="h-6 w-52 max-w-full" />
                    </div>
                    <Skeleton className="h-8 w-36 rounded-lg" />
                </div>
                <div className="space-y-3">
                    {ROW_KEYS.map((row) => (
                        <div
                            key={row}
                            className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-900/40"
                        >
                            <div className="flex items-start gap-3">
                                <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Skeleton className="h-4 w-4/5 max-w-96" />
                                    <Skeleton className="h-3 w-3/5 max-w-72" />
                                </div>
                                <Skeleton className="hidden h-8 w-24 rounded-lg sm:block" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function DashboardSkeleton({
    compact = false,
    className,
    variant = "user",
}: DashboardSkeletonProps): React.JSX.Element {
    if (compact) {
        return (
            <div className={cn("space-y-6", className)}>
                <CompactTabSkeleton />
            </div>
        );
    }

    const statKeys = variant === "admin" ? ADMIN_STAT_KEYS : USER_STAT_KEYS;

    return (
        <div
            className={cn("space-y-6", "min-h-[calc(100vh-100px)]", className)}
            role="status"
            aria-busy="true"
        >
            <span className="sr-only">กำลังโหลดข้อมูลแดชบอร์ด</span>

            <div
                className={cn(
                    "grid min-w-0 grid-cols-1 gap-4 md:gap-6",
                    variant === "admin"
                        ? "md:grid-cols-2 lg:grid-cols-4"
                        : "md:grid-cols-3",
                )}
            >
                {statKeys.map((key, index) => (
                    <StatCardSkeleton
                        key={key}
                        detailed={variant === "admin" && index === 3}
                    />
                ))}
            </div>

            {variant === "admin" && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <SecondaryPanelSkeleton />
                    <SecondaryPanelSkeleton />
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {ACTION_KEYS.map((key) => (
                    <ActionCardSkeleton key={key} />
                ))}
            </div>
        </div>
    );
}
