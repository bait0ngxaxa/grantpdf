import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

interface DashboardSkeletonProps {
    compact?: boolean;
    className?: string;
}

export function DashboardSkeleton({
    compact = false,
    className,
}: DashboardSkeletonProps): React.JSX.Element {
    return (
        <div
            className={cn(
                "space-y-6",
                !compact && "min-h-[calc(100vh-100px)]",
                className,
            )}
        >
            {!compact && (
                <div className="space-y-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80 max-w-full" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl" />
            </div>

            <Skeleton className="h-36 rounded-2xl" />
        </div>
    );
}
