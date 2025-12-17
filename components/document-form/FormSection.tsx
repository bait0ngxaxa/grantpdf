import { ReactNode } from "react";

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
    bgColor = "bg-slate-50",
    borderColor = "border-slate-200",
    headerBorderColor = "border-slate-300",
    icon,
}: FormSectionProps) {
    return (
        <div className={`${bgColor} p-6 rounded-lg border ${borderColor}`}>
            <h3
                className={`text-lg font-semibold text-slate-800 mb-4 pb-2 border-b ${headerBorderColor} flex items-center gap-2`}
            >
                {icon && <span>{icon}</span>}
                {title}
            </h3>
            {children}
        </div>
    );
}
