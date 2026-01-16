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
}) => {
    if (variant === "gradient") {
        return (
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-8 rounded-3xl shadow-lg shadow-blue-500/20 relative overflow-hidden group hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <h3 className="text-xl font-bold mb-3 flex items-center">
                    <span className="bg-white/20 p-2 rounded-lg mr-3">
                        {icon}
                    </span>
                    {title}
                </h3>
                <p className="text-blue-50 mb-6 pl-14 opacity-90">
                    {description}
                </p>
                <Button
                    onClick={onClick}
                    className="w-full h-12 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 hover:scale-[1.02] transition-all duration-300 shadow-lg border-0"
                >
                    {buttonText}
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>

            <h3 className="text-xl font-bold mb-3 flex items-center text-slate-800">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3 shadow-sm">
                    {icon}
                </span>
                {title}
            </h3>
            <p className="text-slate-500 mb-6 pl-14">{description}</p>
            <Button
                onClick={onClick}
                className="w-full h-12 rounded-xl bg-white border-2 border-slate-100 text-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
                {buttonText}
            </Button>
        </div>
    );
};
