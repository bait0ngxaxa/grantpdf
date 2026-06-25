import { ProjectGroupSkeleton } from "./ProjectGroupSkeleton";
import { Skeleton } from "./Skeleton";

const STEP_KEYS = [1, 2, 3] as const;

export function CreateDocsTopBarSkeleton(): React.JSX.Element {
    return (
        <div className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80">
            <div className="mx-auto max-w-7xl px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-3 w-36" />
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 md:flex">
                        {STEP_KEYS.map((step) => (
                            <div key={step} className="flex items-center gap-2">
                                {step > 1 && (
                                    <Skeleton className="h-0.5 w-8 rounded-full" />
                                )}
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>

                    <Skeleton className="h-10 w-10 rounded-xl sm:w-24" />
                </div>

                <div className="mt-4 flex items-center justify-between px-1 md:hidden">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-28" />
                </div>
            </div>
        </div>
    );
}

export function CreateDocsSkeleton(): React.JSX.Element {
    return (
        <div
            className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6"
            role="status"
            aria-busy="true"
        >
            <span className="sr-only">กำลังโหลดหน้าสร้างเอกสาร</span>
            <Skeleton className="mb-6 h-8 w-72 max-w-full sm:mb-8 sm:h-9" />

            <div className="max-h-[60dvh] w-full max-w-4xl space-y-4 overflow-y-auto px-2 py-2">
                <ProjectGroupSkeleton rows={2} />
                <ProjectGroupSkeleton rows={1} />
            </div>

            <Skeleton className="mt-4 h-4 w-72 max-w-full" />

            <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-3 sm:flex sm:justify-center sm:gap-4">
                <Skeleton className="h-11 rounded-xl sm:w-40" />
                <Skeleton className="h-11 rounded-xl sm:w-44" />
            </div>
        </div>
    );
}
