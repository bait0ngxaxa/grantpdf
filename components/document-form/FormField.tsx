"use client";

import { ChangeEvent } from "react";
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
}: FormFieldProps) {
    const baseClassName = `w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`;

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === "textarea" ? (
                <Textarea
                    name={name}
                    placeholder={placeholder}
                    className={baseClassName}
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
                />
            )}
        </div>
    );
}
