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
    const baseClassName = `w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 placeholder:text-slate-400 hover:border-blue-200 ${className}`;

    return (
        <div className="group">
            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1 group-hover:text-blue-600 transition-colors">
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
                />
            )}
        </div>
    );
}
