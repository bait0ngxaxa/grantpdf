export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="flex flex-col items-center space-y-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-gray-600 dark:text-gray-400">
                    กำลังโหลดข้อมูล...
                </p>
            </div>
        </div>
    );
}
