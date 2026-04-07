import { CreateDocsSkeleton } from "@/components/ui";

export default function Loading(): React.JSX.Element {
    return (
        <div className="max-w-6xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col">
            <CreateDocsSkeleton />
        </div>
    );
}
