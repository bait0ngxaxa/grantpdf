import { Skeleton } from "./Skeleton";

interface FileListSkeletonProps {
    label: string;
}

const SKELETON_ROWS = [1, 2, 3] as const;

export function FileListSkeleton({
    label,
}: FileListSkeletonProps): React.JSX.Element {
    return (
        <div
            className="space-y-3"
            role="status"
            aria-busy="true"
            aria-live="polite"
        >
            <span className="sr-only">{label}</span>
            {SKELETON_ROWS.map((row) => (
                <div
                    key={row}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                    <Skeleton
                        aria-hidden="true"
                        className="hidden h-10 w-10 shrink-0 rounded-lg sm:block"
                    />
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                        <Skeleton
                            aria-hidden="true"
                            className="h-10 w-10 shrink-0 rounded-lg sm:hidden"
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton
                                aria-hidden="true"
                                className="h-4 w-3/5 max-w-96"
                            />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton
                                    aria-hidden="true"
                                    className="h-4 w-28 rounded-full"
                                />
                                <Skeleton
                                    aria-hidden="true"
                                    className="h-4 w-24 rounded-full"
                                />
                                <Skeleton
                                    aria-hidden="true"
                                    className="h-5 w-14 rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-2 pl-[52px] sm:pl-0">
                        <Skeleton
                            aria-hidden="true"
                            className="h-9 w-9 rounded-xl"
                        />
                        <Skeleton
                            aria-hidden="true"
                            className="h-9 w-9 rounded-xl"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
