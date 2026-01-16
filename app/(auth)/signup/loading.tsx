export default function Loading(): React.JSX.Element {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="flex flex-col items-center space-y-4">
                <span className="loading loading-spinner loading-lg text-primary" />
                <p className="text-gray-600 dark:text-gray-400">กำลังโหลด...</p>
            </div>
        </div>
    );
}
