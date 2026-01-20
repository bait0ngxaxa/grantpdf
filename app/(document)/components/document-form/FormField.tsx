"use client";

import { type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormFieldProps {
    label: string;
    name: string;
    type?: "text" | "email" | "number" | "tel" | "textarea";
    placeholder?: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    required?: boolean;
    rows?: number;
    className?: string;
    error?: string;
    maxLength?: number;
}

export function FormField({
    label,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    required = false,
    rows = 4,
    className = "",
    error,
    maxLength,
}: FormFieldProps): React.JSX.Element {
    const hasError = !!error;
    const baseClassName = `w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl focus:ring-4 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 ${
        hasError
            ? "border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-400"
            : "border-slate-200 dark:border-slate-700 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 dark:focus:border-blue-500 hover:border-blue-200 dark:hover:border-blue-600"
    } ${className}`;

    return (
        <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === "textarea" ? (
                <Textarea
                    name={name}
                    placeholder={placeholder}
                    className={`${baseClassName} min-h-[120px] resize-y`}
                    value={value}
                    onChange={onChange}
                    rows={rows}
                    required={required}
                />
            ) : (
                <Input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    className={baseClassName}
                    value={value}
                    onChange={onChange}
                    required={required}
                    maxLength={maxLength}
                />
            )}
            {error && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1 ml-1">
                    {error}
                </p>
            )}
        </div>
    );
}
