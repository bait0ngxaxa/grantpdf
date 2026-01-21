"use client";

import React from "react";
import { useCreateDocsContext } from "../contexts";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export const CreateDocsTopBar = (): React.JSX.Element => {
    const {
        selectedProjectId,
        selectedCategory,
        selectedContractType,
        goBack,
    } = useCreateDocsContext();
    const router = useRouter();

    // Determine current step
    let currentStep = 1;
    if (selectedContractType)
        currentStep = 4; // Final selection
    else if (selectedCategory) currentStep = 3;
    else if (selectedProjectId) currentStep = 2;

    const steps = [
        { number: 1, label: "เลือกโครงการ" },
        { number: 2, label: "เลือกหมวดหมู่" }, // Main Menu
        { number: 3, label: "เลือกประเภท" }, // Submenu
    ];

    return (
        <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Back & Title */}
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goBack}
                            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
                                สร้างเอกสาร
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                Create New Document
                            </p>
                        </div>
                    </div>

                    {/* Center: Stepper (Hidden on small screens) */}
                    <div className="hidden md:flex items-center space-x-2">
                        {steps.map((step, index) => {
                            const isCompleted = currentStep > step.number;
                            const isActive = currentStep === step.number;

                            return (
                                <React.Fragment key={step.number}>
                                    {/* Connector Line */}
                                    {index > 0 && (
                                        <div
                                            className={`w-8 h-0.5 rounded-full ${
                                                isCompleted
                                                    ? "bg-blue-600 dark:bg-blue-500"
                                                    : "bg-slate-200 dark:bg-slate-700"
                                            }`}
                                        />
                                    )}

                                    {/* Step Circle & Label */}
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                                isCompleted
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                    : isActive
                                                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 shadow-md"
                                                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700"
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                step.number
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm font-medium transition-colors duration-300 ${
                                                isActive || isCompleted
                                                    ? "text-slate-900 dark:text-slate-100"
                                                    : "text-slate-400 dark:text-slate-600"
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Right: Exit */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(ROUTES.DASHBOARD)}
                        className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <X className="h-5 w-5 mr-1" />
                        <span className="hidden sm:inline">ยกเลิก</span>
                    </Button>
                </div>

                {/* Mobile text progress */}
                <div className="md:hidden mt-4 flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        ขั้นตอนที่ {currentStep} จาก 3
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        {steps[currentStep - 1]?.label}
                    </span>
                </div>
            </div>
        </div>
    );
};
