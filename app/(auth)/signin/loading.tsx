export default function Loading(): React.JSX.Element {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col items-center space-y-4">
                <span className="loading loading-spinner loading-lg text-primary" />
                <p className="text-slate-600 dark:text-slate-400">
                    กำลังโหลด...
                </p>
            </div>
        </div>
    );
}
