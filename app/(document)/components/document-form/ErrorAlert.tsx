import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
    message: string | null;
    isError: boolean;
}

export function ErrorAlert({
    message,
    isError,
}: ErrorAlertProps): React.JSX.Element | null {
    if (!message || !isError) return null;

    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mt-6">
            <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{message}</span>
            </div>
        </div>
    );
}
