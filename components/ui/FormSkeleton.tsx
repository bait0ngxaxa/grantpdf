import { Skeleton } from "./Skeleton";

export function FormSkeleton(): React.JSX.Element {
    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-6">
            <div className="space-y-3">
                <Skeleton className="h-8 w-72 max-w-full" />
                <Skeleton className="h-4 w-[32rem] max-w-full" />
            </div>

            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
    );
}
