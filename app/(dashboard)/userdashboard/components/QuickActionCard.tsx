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
            <div className="group relative min-w-0 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-blue-500/30 sm:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <h3 className="mb-3 flex min-w-0 items-center text-lg font-bold break-words text-balance sm:text-xl">
                    <span className="mr-3 shrink-0 rounded-lg bg-white/20 p-2">
                        {icon}
                    </span>
                    {title}
                </h3>
                <p className="mb-6 break-words text-blue-50 opacity-90 sm:pl-14">
                    {description}
                </p>
                <Button
                    onClick={onClick}
                    className="min-h-12 w-full rounded-xl border-0 bg-white py-2 font-bold text-blue-600 shadow-lg transition duration-300 hover:scale-[1.02] hover:bg-blue-50"
                >
                    {buttonText}
                </Button>
            </div>
        );
    }

    return (
        <div className="group relative min-w-0 overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:shadow-xl hover:shadow-blue-100/50 dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-blue-900/30 sm:p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 dark:from-blue-900/30 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform" />

            <h3 className="mb-3 flex min-w-0 items-center text-lg font-bold break-words text-slate-800 text-balance dark:text-slate-100 sm:text-xl">
                <span className="mr-3 shrink-0 rounded-lg bg-blue-100 p-2 text-blue-600 shadow-sm dark:bg-blue-900/50 dark:text-blue-400">
                    {icon}
                </span>
                {title}
            </h3>
            <p className="mb-6 break-words text-slate-500 dark:text-slate-400 sm:pl-14">
                {description}
            </p>
            <Button
                onClick={onClick}
                className="min-h-12 w-full rounded-xl border-2 border-slate-100 bg-white py-2 font-bold text-slate-700 shadow-sm transition duration-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:border-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            >
                {buttonText}
            </Button>
        </div>
    );
};
