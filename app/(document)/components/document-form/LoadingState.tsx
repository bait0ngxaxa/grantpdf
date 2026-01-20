export function LoadingState(): React.JSX.Element {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
            <div className="text-center">
                <p className="text-gray-500 dark:text-slate-400">
                    กำลังโหลด...
                </p>
            </div>
        </div>
    );
}
