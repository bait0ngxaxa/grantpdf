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
        <div className="navbar bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 mb-6 p-2 sticky top-4 z-40">
            <div className="flex-1">
                <Button
                    onClick={onBack}
                    variant="ghost"
                    className="group flex items-center gap-2 px-4 py-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all duration-200 rounded-xl"
                >
                    <div className="p-1 rounded-lg bg-slate-100 group-hover:bg-white border border-slate-200 group-hover:border-slate-300 transition-colors">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    <span className="font-medium">ย้อนกลับ</span>
                </Button>
            </div>
            <div className="flex-none flex items-center space-x-4 px-4">
                {selectedContractType && (
                    <div className="breadcrumbs text-sm text-slate-500">
                        <ul>
                            <li>
                                <button
                                    onClick={() => {
                                        onCategorySelect(null);
                                        onContractTypeSelect(null);
                                    }}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    หน้าหลัก
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onContractTypeSelect(null)}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    ยื่นโครงการ
                                </button>
                            </li>
                            <li className="text-slate-900 font-medium">
                                สัญญาจ้างปฏิบัติงานวิชาการ
                            </li>
                        </ul>
                    </div>
                )}
                {selectedCategory && !selectedContractType && (
                    <div className="breadcrumbs text-sm text-slate-500">
                        <ul>
                            <li>
                                <button
                                    onClick={() => onCategorySelect(null)}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    หน้าหลัก
                                </button>
                            </li>
                            <li className="text-slate-900 font-medium">
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
