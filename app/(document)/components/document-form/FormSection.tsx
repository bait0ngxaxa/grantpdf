import { type ReactNode } from "react";

interface FormSectionProps {
    title: string;
    children: ReactNode;
    bgColor?: string;
    borderColor?: string;
    headerBorderColor?: string;
    icon?: ReactNode;
}

export function FormSection({
    title,
    children,
    bgColor = "bg-slate-50 dark:bg-slate-800/50",
    borderColor = "border-slate-200 dark:border-slate-700",
    headerBorderColor = "border-slate-300 dark:border-slate-600",
    icon,
}: FormSectionProps): React.JSX.Element {
    return (
        <div
            className={`group ${bgColor} p-6 md:p-8 rounded-3xl border ${borderColor} hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm transition-all duration-300`}
        >
            <div
                className={`flex items-center gap-3 mb-6 pb-4 border-b ${headerBorderColor}`}
            >
                {icon && (
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                        {icon}
                    </div>
                )}
                <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    {title}
                </h3>
            </div>
            <div className="space-y-6">{children}</div>
        </div>
    );
}
