"use client";

import { type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { RichTextField } from "@/app/(document)/components/document-form/RichTextField";
import { cn } from "@/lib/utils";

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
    constrainToA4?: boolean;
}

export function FormField({
    label,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    required = false,
    className = "",
    error,
    maxLength,
}: FormFieldProps): React.JSX.Element {
    const hasError = !!error;
    const shouldShowCounter = typeof maxLength === "number";
    const baseClassName = cn(
        "w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl focus:ring-4 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100",
        hasError
            ? "border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-400"
            : "border-slate-200 dark:border-slate-700 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 dark:focus:border-blue-500 hover:border-blue-200 dark:hover:border-blue-600",
        className,
    );
    const handleRichTextChange = (_name: string, nextValue: string): void => {
        const target = { name, value: nextValue } as HTMLTextAreaElement;
        onChange({ target } as ChangeEvent<HTMLTextAreaElement>);
    };

    if (type === "textarea") {
        return (
            <RichTextField
                label={label}
                name={name}
                placeholder={placeholder}
                className={className}
                value={value}
                onValueChange={handleRichTextChange}
                required={required}
                maxLength={maxLength}
                error={error}
            />
        );
    }

    return (
        <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {label} {required ? <span className="text-red-500">*</span> : null}
            </label>
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
            {shouldShowCounter && (
                <p className="mt-1 ml-1 text-right text-xs text-slate-500 dark:text-slate-400">
                    {value.length}/{maxLength}
                </p>
            )}
            {error && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1 ml-1">
                    {error}
                </p>
            )}
        </div>
    );
}

