export default function Loading(): React.JSX.Element {
    return (
        <div className="max-w-6xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col">
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                        กำลังโหลด...
                    </p>
                </div>
            </div>
        </div>
    );
}
