import { Skeleton } from "./Skeleton";

export function CreateDocsSkeleton(): React.JSX.Element {
    return (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-6xl space-y-8">
                <div className="space-y-3 mx-auto w-full max-w-md">
                    <Skeleton className="h-9 w-56 mx-auto" />
                    <Skeleton className="h-4 w-72 max-w-full mx-auto" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-72 rounded-3xl" />
                    <Skeleton className="h-72 rounded-3xl" />
                    <Skeleton className="h-72 rounded-3xl" />
                </div>
            </div>
        </div>
    );
}
