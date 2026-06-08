import { Skeleton } from "@/components/ui";

export default function Loading(): React.JSX.Element {
  return (
    <div className="min-h-dvh bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-6xl items-center gap-6 sm:min-h-[calc(100dvh-4rem)] sm:gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,460px)] lg:gap-12">
        <div className="hidden max-w-xl flex-col space-y-5 lg:flex">
          <Skeleton className="h-12 w-80 rounded-lg" />
          <Skeleton className="h-12 w-72 rounded-lg" />
          <Skeleton className="h-7 w-full max-w-[31rem] rounded-lg" />
        </div>

        <div className="mx-auto w-full max-w-lg">
          <div className="mb-6 space-y-2 text-center lg:hidden">
            <Skeleton className="mx-auto h-8 w-56 rounded-lg" />
            <Skeleton className="mx-auto h-6 w-24 rounded-lg" />
          </div>
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-900">
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="h-5 w-56 rounded-lg" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-20 rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <Skeleton className="mt-2 h-11 w-full rounded-lg" />
            <Skeleton className="mx-auto h-4 w-40 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
