import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({
    className,
    ...props
}: SkeletonProps): React.JSX.Element {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/60",
                className,
            )}
            {...props}
        />
    );
}
