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
        bg: "bg-blue-50",
        text: "text-blue-600",
        hover: "hover:shadow-blue-100/50",
        accent: "bg-blue-50/50",
        hoverBg: "group-hover:bg-blue-600",
    },
    purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        hover: "hover:shadow-purple-100/50",
        accent: "bg-purple-50/50",
        hoverBg: "group-hover:bg-purple-600",
    },
    green: {
        bg: "bg-green-50",
        text: "text-green-600",
        hover: "hover:shadow-green-100/50",
        accent: "bg-green-50/50",
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
}) => {
    const colors = colorClasses[colorTheme];

    return (
        <div
            className={`group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl ${colors.hover} hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}
        >
            <div
                className={`absolute top-0 right-0 w-24 h-24 ${colors.accent} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}
            ></div>
            <div className="flex items-start space-x-4 relative z-10">
                <div
                    className={`${colors.bg} ${colors.text} p-3.5 rounded-2xl flex-shrink-0 ${colors.hoverBg} group-hover:text-white transition-colors duration-300 shadow-sm`}
                >
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-500 mb-1">
                        {title}
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">
                        {value}
                    </div>
                    <div className="text-sm text-slate-400">{subtitle}</div>
                    {children}
                </div>
            </div>
        </div>
    );
};
