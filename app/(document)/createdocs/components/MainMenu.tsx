"use client";

import { useRouter } from "next/navigation";
import { FileText, FileBarChart, Building2 } from "lucide-react";
import { useCreateDocsContext } from "../contexts";

export const MainMenu = (): React.JSX.Element => {
    const router = useRouter();
    const {
        isAdmin,
        selectedProjectId,
        handleCategorySelection,
        handleSummarySelection,
    } = useCreateDocsContext();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100">
                สร้างเอกสาร
            </h1>

            <div
                className={`${
                    isAdmin
                        ? "grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl"
                        : "flex justify-center w-full max-w-lg"
                }`}
            >
                {/* สัญญาจ้างทั่วไป Card - แสดงเฉพาะแอดมิน */}
                {isAdmin && (
                    <div
                        className="group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        onClick={() => handleCategorySelection("general")}
                    >
                        <div className="flex flex-col items-center text-center h-full">
                            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <FileText
                                    className="h-12 w-12"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                เอกสารสัญญาจ้างทั่วไป
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                สำหรับการจ้างงานทั่วไป
                            </p>
                            <div className="mt-auto">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    2 เอกสาร
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* แบบสรุปโครงการ Card - แสดงเฉพาะแอดมิน */}
                {isAdmin && (
                    <div
                        className="group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        onClick={() => handleSummarySelection()}
                    >
                        <div className="flex flex-col items-center text-center h-full">
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                <FileBarChart
                                    className="h-12 w-12"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                แบบสรุปโครงการ
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                สำหรับสรุปผลการดำเนินโครงการ
                            </p>
                            <div className="mt-auto">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    1 เอกสาร
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ยื่นโครงการ Card - แสดงสำหรับทุกคน */}
                <div
                    className={`group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-pink-200 dark:hover:border-pink-800 transition-all duration-300 cursor-pointer hover:-translate-y-1 ${
                        !isAdmin ? "w-full" : ""
                    }`}
                    onClick={() => handleCategorySelection("project")}
                >
                    <div className="flex flex-col items-center text-center h-full">
                        <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-900/50 text-pink-500 dark:text-pink-400 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                            <Building2
                                className="h-12 w-12"
                                strokeWidth={1.5}
                            />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            เอกสารยื่นโครงการ
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            สำหรับการยื่นโครงการ
                        </p>
                        <div className="mt-auto">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                3 เอกสาร
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {selectedProjectId && (
                <div className="text-center mt-12">
                    <p className="text-slate-500 dark:text-slate-400">
                        หรือ{" "}
                        <button
                            onClick={() => {
                                router.push(
                                    `/uploads-doc?projectId=${encodeURIComponent(
                                        selectedProjectId,
                                    )}`,
                                );
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold hover:underline transition-colors"
                        >
                            อัพโหลดเอกสาร
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
};
