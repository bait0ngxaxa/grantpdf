import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

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
            className={cn("group p-6 md:p-8 rounded-3xl border hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm duration-300 transition", bgColor, borderColor)}
        >
            <div
                className={cn("flex items-center gap-3 mb-6 pb-4 border-b", headerBorderColor)}
            >
                {icon && (
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                        {icon}
                    </div>
                )}
                <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight text-balance">
                    {title}
                </h3>
            </div>
            <div className="space-y-6">{children}</div>
        </div>
    );
}
