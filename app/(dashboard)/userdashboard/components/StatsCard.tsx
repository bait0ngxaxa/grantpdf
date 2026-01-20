import React from "react";

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    colorTheme: "blue" | "purple" | "green";
    children?: React.ReactNode;
}

const colorClasses = {
    blue: {
        bg: "bg-blue-50 dark:bg-blue-900/50",
        text: "text-blue-600 dark:text-blue-400",
        hover: "hover:shadow-blue-100/50 dark:hover:shadow-blue-900/30",
        accent: "bg-blue-100 dark:bg-blue-900/30",
        hoverBg: "group-hover:bg-blue-600",
    },
    purple: {
        bg: "bg-purple-50 dark:bg-purple-900/50",
        text: "text-purple-600 dark:text-purple-400",
        hover: "hover:shadow-purple-100/50 dark:hover:shadow-purple-900/30",
        accent: "bg-purple-100 dark:bg-purple-900/30",
        hoverBg: "group-hover:bg-purple-600",
    },
    green: {
        bg: "bg-green-50 dark:bg-green-900/50",
        text: "text-green-600 dark:text-green-400",
        hover: "hover:shadow-green-100/50 dark:hover:shadow-green-900/30",
        accent: "bg-green-100 dark:bg-green-900/30",
        hoverBg: "group-hover:bg-green-600",
    },
};

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    colorTheme,
    children,
}): React.JSX.Element => {
    const colors = colorClasses[colorTheme];

    return (
        <div
            className={`group bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl ${colors.hover} hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}
        >
            <div
                className={`absolute top-0 right-0 w-24 h-24 ${colors.accent} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}
            />
            <div className="flex items-start space-x-4 relative z-10">
                <div
                    className={`${colors.bg} ${colors.text} p-3.5 rounded-2xl flex-shrink-0 ${colors.hoverBg} group-hover:text-white transition-colors duration-300 shadow-sm`}
                >
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        {title}
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                        {value}
                    </div>
                    <div className="text-sm text-slate-400 dark:text-slate-500">
                        {subtitle}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};
