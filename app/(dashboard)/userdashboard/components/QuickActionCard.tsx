import React from "react";
import { Button } from "@/components/ui/button";

interface QuickActionCardProps {
    title: string;
    description: string;
    buttonText: string;
    onClick: () => void;
    icon: React.ReactNode;
    variant?: "default" | "gradient";
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
    title,
    description,
    buttonText,
    onClick,
    icon,
    variant = "default",
}): React.JSX.Element => {
    if (variant === "gradient") {
        return (
            <div className="group relative min-w-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 p-5 text-white shadow-lg shadow-blue-500/20 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 sm:p-6">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

                <h3 className="relative z-10 mb-3 flex min-w-0 items-center gap-3 break-words text-base font-black text-balance sm:text-lg">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/18 shadow-sm ring-1 ring-white/20">
                        {icon}
                    </span>
                    {title}
                </h3>
                <p className="relative z-10 mb-5 break-words text-sm font-medium leading-6 text-blue-50/90 sm:pl-14">
                    {description}
                </p>
                <Button
                    onClick={onClick}
                    className="relative z-10 h-11 w-full rounded-xl border-0 bg-white px-5 py-2 font-bold text-blue-600 shadow-lg shadow-blue-950/10 transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-xl sm:ml-14 sm:w-auto"
                >
                    {buttonText}
                </Button>
            </div>
        );
    }

    return (
        <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm shadow-slate-200/60 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-100/60 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none dark:hover:border-blue-900/50 dark:hover:bg-slate-900 dark:hover:shadow-blue-950/20 sm:p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />

            <h3 className="relative z-10 mb-3 flex min-w-0 items-center gap-3 break-words text-base font-black text-slate-900 text-balance dark:text-slate-100 sm:text-lg">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/40 dark:text-blue-300">
                    {icon}
                </span>
                {title}
            </h3>
            <p className="relative z-10 mb-5 break-words text-sm font-medium leading-6 text-slate-500 dark:text-slate-400 sm:pl-14">
                {description}
            </p>
            <Button
                onClick={onClick}
                className="relative z-10 h-11 w-full rounded-xl border border-blue-100 bg-blue-50 px-5 py-2 font-bold text-blue-700 shadow-sm transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:shadow-md dark:border-blue-900/50 dark:bg-blue-950/35 dark:text-blue-200 dark:hover:bg-blue-900/50 sm:ml-14 sm:w-auto"
            >
                {buttonText}
            </Button>
        </div>
    );
};
