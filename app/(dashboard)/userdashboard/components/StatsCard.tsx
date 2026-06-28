import React from "react";
import { cn } from "@/lib/shared/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    valueTitle?: string;
    subtitle: string;
    icon: React.ReactNode;
    colorTheme: "blue" | "purple" | "green";
    children?: React.ReactNode;
}

const colorClasses = {
    blue: {
        bg: "bg-blue-50 dark:bg-blue-950/40",
        text: "text-blue-600 dark:text-blue-300",
        hover: "hover:border-blue-100 hover:shadow-blue-100/60 dark:hover:border-blue-900/50 dark:hover:shadow-blue-950/20",
        accent: "from-transparent via-blue-300/70 to-transparent",
        hoverBg: "group-hover:bg-blue-600",
    },
    purple: {
        bg: "bg-indigo-50 dark:bg-indigo-950/40",
        text: "text-indigo-600 dark:text-indigo-300",
        hover: "hover:border-indigo-100 hover:shadow-indigo-100/60 dark:hover:border-indigo-900/50 dark:hover:shadow-indigo-950/20",
        accent: "from-transparent via-indigo-300/70 to-transparent",
        hoverBg: "group-hover:bg-indigo-600",
    },
    green: {
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        text: "text-emerald-600 dark:text-emerald-300",
        hover: "hover:border-emerald-100 hover:shadow-emerald-100/60 dark:hover:border-emerald-900/50 dark:hover:shadow-emerald-950/20",
        accent: "from-transparent via-emerald-300/70 to-transparent",
        hoverBg: "group-hover:bg-emerald-600",
    },
};

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    valueTitle,
    subtitle,
    icon,
    colorTheme,
    children,
}): React.JSX.Element => {
    const colors = colorClasses[colorTheme];
    const isTextValue = typeof value === "string";

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm shadow-slate-200/60 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900",
                colors.hover,
            )}
        >
            <div
                className={cn(
                    "absolute inset-x-0 top-0 h-px bg-gradient-to-r",
                    colors.accent,
                )}
            />
            <div className="relative z-10 flex items-start gap-3.5">
                <div
                    className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-colors duration-300 group-hover:text-white",
                        colors.bg,
                        colors.text,
                        colors.hoverBg,
                    )}
                >
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        {title}
                    </div>
                    <div
                        title={valueTitle}
                        className={cn(
                            "mb-2 min-w-0 max-w-full font-black leading-none text-slate-900 dark:text-slate-100",
                            isTextValue
                                ? "truncate whitespace-nowrap text-2xl sm:text-3xl"
                                : "text-3xl",
                        )}
                    >
                        {value}
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {subtitle}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};
