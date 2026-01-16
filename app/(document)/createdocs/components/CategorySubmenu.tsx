"use client";

import {
    FileText,
    ClipboardList,
    Zap,
    BookOpen,
    ClipboardCheck,
} from "lucide-react";

interface CategorySubmenuProps {
    selectedCategory: string;
    isAdmin: boolean;
    onApprovalSelect: () => void;
    onTorSelect: () => void;
    onFormProjectSelect: () => void;
    onContractTypeSelect: (type: string) => void;
    onCategorySelect: (category: string | null) => void;
}

export const CategorySubmenu = ({
    selectedCategory,
    isAdmin,
    onApprovalSelect,
    onTorSelect,
    onFormProjectSelect,
    onContractTypeSelect,
    onCategorySelect,
}: CategorySubmenuProps) => {
    if (selectedCategory === "general") {
        if (!isAdmin) {
            onCategorySelect(null);
            return null;
        }

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="flex items-center justify-center mb-4">
                    <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">
                        สัญญาจ้างทั่วไป
                    </h1>
                </div>
                <p className="text-center text-slate-500 mb-8">
                    เลือกเอกสารที่ต้องการสร้าง
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    <div
                        className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        onClick={() => onApprovalSelect()}
                    >
                        <div className="flex flex-col items-center text-center h-full">
                            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <FileText
                                    className="h-12 w-12"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                หนังสือขออนุมัติของมูลนิธิ
                            </h3>
                            <p className="text-sm text-slate-500">
                                เอกสารขออนุมัติดำเนินโครงการจากมูลนิธิ
                            </p>
                        </div>
                    </div>

                    <div
                        className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        onClick={() => onTorSelect()}
                    >
                        <div className="flex flex-col items-center text-center h-full">
                            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <ClipboardList
                                    className="h-12 w-12"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                ขอบเขตของงาน (TOR)
                            </h3>
                            <p className="text-sm text-slate-500">
                                กำหนดขอบเขตและรายละเอียดของงาน
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else if (selectedCategory === "project") {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">
                    ยื่นโครงการ
                </h1>
                <p className="text-center text-slate-500 mb-8">
                    เลือกเอกสารที่ต้องการสร้าง
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                    <div
                        className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-pink-200 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        onClick={() => onFormProjectSelect()}
                    >
                        <div className="flex flex-col items-center text-center h-full">
                            <div className="p-4 rounded-2xl bg-pink-50 text-pink-500 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                                <Zap className="h-12 w-12" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                ข้อเสนอโครงการ
                            </h3>
                            <p className="text-sm text-slate-500">
                                เอกสารเสนอโครงการและแผนงาน
                            </p>
                        </div>
                    </div>

                    <div
                        className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-pink-200 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        onClick={() => onContractTypeSelect("academic")}
                    >
                        <div className="flex flex-col items-center text-center h-full">
                            <div className="p-4 rounded-2xl bg-pink-50 text-pink-500 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                                <BookOpen
                                    className="h-12 w-12"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                สัญญาจ้างปฎิบัติงานวิชาการ
                            </h3>
                            <p className="text-sm text-slate-500">
                                สัญญาจ้างสำหรับงานวิชาการเฉพาะ
                            </p>
                        </div>
                    </div>

                    <div
                        className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-pink-200 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        onClick={() => onTorSelect()}
                    >
                        <div className="flex flex-col items-center text-center h-full">
                            <div className="p-4 rounded-2xl bg-pink-50 text-pink-500 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                                <ClipboardCheck
                                    className="h-12 w-12"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                ขอบเขตของงาน (TOR)
                            </h3>
                            <p className="text-sm text-slate-500">
                                กำหนดขอบเขตงานสำหรับโครงการ
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};
