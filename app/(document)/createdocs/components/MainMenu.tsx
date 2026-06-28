"use client";

import Link from "next/link";
import { FileText, FileBarChart, Building2, UploadCloud } from "lucide-react";
import { useCreateDocsContext } from "../contexts";
import { cn } from "@/lib/shared/utils";

export const MainMenu = (): React.JSX.Element => {
    const {
        isAdmin,
        selectedProjectId,
        handleCategorySelection,
        handleSummarySelection,
    } = useCreateDocsContext();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100 text-balance">
                สร้างเอกสาร
            </h1>

            <div
                className={cn(
                    isAdmin
                        ? "grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl"
                        : "flex justify-center w-full max-w-lg",
                )}
            >
                {/* สัญญาจ้างทั่วไป Card - แสดงเฉพาะแอดมิน */}
                {isAdmin && (
                    <div
                        className="group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 duration-300 cursor-pointer hover:-translate-y-1 transition"
                        onClick={() => handleCategorySelection("general")}
                    >
                        <div className="flex flex-col items-center text-center h-full">
                            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <FileText
                                    className="h-12 w-12"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-balance">
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
                        className="group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-amber-200 dark:hover:border-amber-800 duration-300 cursor-pointer hover:-translate-y-1 transition"
                        onClick={() => handleSummarySelection()}
                    >
                        <div className="flex flex-col items-center text-center h-full">
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                <FileBarChart
                                    className="h-12 w-12"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-balance">
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
                    className={cn(
                        "group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-pink-200 dark:hover:border-pink-800 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-300 cursor-pointer hover:-translate-y-1",
                        !isAdmin && "w-full",
                    )}
                    onClick={() => handleCategorySelection("project")}
                >
                    <div className="flex flex-col items-center text-center h-full">
                        <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-900/50 text-pink-500 dark:text-pink-400 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                            <Building2
                                className="h-12 w-12"
                                strokeWidth={1.5}
                            />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-balance">
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
                <div className="mt-12 w-full max-w-lg">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                            หรือ
                        </span>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    </div>

                    <Link
                        href={`/uploads-doc?projectId=${encodeURIComponent(
                            selectedProjectId,
                        )}`}
                        className="group flex min-w-0 items-center gap-4 rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm transition-[border-color,box-shadow,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-100/60 dark:border-blue-900/40 dark:bg-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-900/20 dark:hover:shadow-blue-950/30"
                    >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/40 dark:text-blue-300">
                            <UploadCloud className="h-6 w-6" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                                อัพโหลดเอกสาร
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                                แนบเอกสารที่จัดเตรียมไว้แล้วเข้าสู่โครงการนี้
                            </span>
                        </span>
                        <span className="hidden rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-transform duration-300 group-hover:translate-x-0.5 sm:inline-flex">
                            ไปอัปโหลด
                        </span>
                    </Link>
                </div>
            )}
        </div>
    );
};
