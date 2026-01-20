"use client";
import React from "react";
import { Search, Archive, Building2, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: "project" | "search" | "building" | LucideIcon;
    children?: React.ReactNode;
}

export function EmptyState({
    title,
    description,
    icon = "project",
    children,
}: EmptyStateProps): React.JSX.Element {
    const renderIcon = (): React.JSX.Element => {
        if (typeof icon !== "string") {
            const Icon = icon;
            return (
                <Icon className="mx-auto h-24 w-24 text-slate-300 dark:text-slate-600" />
            );
        }

        switch (icon) {
            case "search":
                return (
                    <Search className="mx-auto h-24 w-24 text-slate-300 dark:text-slate-600" />
                );
            case "building":
                return (
                    <Building2 className="mx-auto h-24 w-24 text-slate-300 dark:text-slate-600" />
                );
            case "project":
            default:
                return (
                    <Archive className="mx-auto h-24 w-24 text-slate-300 dark:text-slate-600" />
                );
        }
    };

    return (
        <div className="text-center py-12">
            {renderIcon()}
            <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                {title}
            </h3>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
                {description}
            </p>
            {children && <div className="mt-6">{children}</div>}
        </div>
    );
}
