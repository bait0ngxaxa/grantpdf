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
          className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-700"
        >
          <Skeleton
            aria-hidden="true"
            className="h-10 w-10 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton aria-hidden="true" className="h-4 w-2/5 max-w-48" />
            <Skeleton aria-hidden="true" className="h-3 w-3/4 max-w-80" />
          </div>
          <Skeleton
            aria-hidden="true"
            className="hidden h-8 w-16 shrink-0 rounded-lg sm:block"
          />
        </div>
      ))}
    </div>
  );
}
