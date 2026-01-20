"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface NavBarProps {
    selectedCategory: string | null;
    selectedContractType: string | null;
    onBack: () => void;
    onCategorySelect: (category: string | null) => void;
    onContractTypeSelect: (type: string | null) => void;
}

export const NavBar = ({
    selectedCategory,
    selectedContractType,
    onBack,
    onCategorySelect,
    onContractTypeSelect,
}: NavBarProps): React.JSX.Element => {
    return (
        <div className="navbar bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 p-2 sticky top-4 z-40">
            <div className="flex-1">
                <Button
                    onClick={onBack}
                    variant="ghost"
                    className="group flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 rounded-xl"
                >
                    <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-white dark:group-hover:bg-slate-600 border border-slate-200 dark:border-slate-600 group-hover:border-slate-300 dark:group-hover:border-slate-500 transition-colors">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    <span className="font-medium">ย้อนกลับ</span>
                </Button>
            </div>
            <div className="flex-none flex items-center space-x-4 px-4">
                {selectedContractType && (
                    <div className="breadcrumbs text-sm text-slate-500 dark:text-slate-400">
                        <ul>
                            <li>
                                <button
                                    onClick={() => {
                                        onCategorySelect(null);
                                        onContractTypeSelect(null);
                                    }}
                                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    หน้าหลัก
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onContractTypeSelect(null)}
                                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    ยื่นโครงการ
                                </button>
                            </li>
                            <li className="text-slate-900 dark:text-slate-100 font-medium">
                                สัญญาจ้างปฏิบัติงานวิชาการ
                            </li>
                        </ul>
                    </div>
                )}
                {selectedCategory && !selectedContractType && (
                    <div className="breadcrumbs text-sm text-slate-500 dark:text-slate-400">
                        <ul>
                            <li>
                                <button
                                    onClick={() => onCategorySelect(null)}
                                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    หน้าหลัก
                                </button>
                            </li>
                            <li className="text-slate-900 dark:text-slate-100 font-medium">
                                {selectedCategory === "general"
                                    ? "สัญญาจ้างทั่วไป"
                                    : "ยื่นโครงการ"}
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
