import { Skeleton } from "@/components/ui";

export default function Loading(): React.JSX.Element {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="hidden md:flex flex-col space-y-6 p-8">
                    <Skeleton className="h-12 w-80 rounded-xl" />
                    <Skeleton className="h-12 w-72 rounded-xl" />
                    <Skeleton className="h-7 w-64 rounded-xl" />
                </div>

                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-100/50 dark:shadow-slate-900/50 p-8 md:p-10 border border-slate-100 dark:border-slate-700 space-y-5">
                        <Skeleton className="h-8 w-36 rounded-xl" />
                        <Skeleton className="h-5 w-56 rounded-xl" />
                        <div className="space-y-3 pt-2">
                            <Skeleton className="h-4 w-20 rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-24 rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                        <Skeleton className="h-12 w-full rounded-xl mt-2" />
                        <Skeleton className="h-4 w-40 mx-auto rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}
