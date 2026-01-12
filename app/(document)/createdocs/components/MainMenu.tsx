"use client";

import { useRouter } from "next/navigation";

interface MainMenuProps {
    isAdmin: boolean;
    selectedProjectId: string | null;
    onCategorySelect: (category: string) => void;
    onSummarySelect: () => void;
}

export const MainMenu = ({
    isAdmin,
    selectedProjectId,
    onCategorySelect,
    onSummarySelect,
}: MainMenuProps) => {
    const router = useRouter();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-center mb-8 text-slate-800">
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
                        className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        onClick={() => onCategorySelect("general")}
                    >
                        <div className="flex flex-col items-center text-center h-full">
                            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                เอกสารสัญญาจ้างทั่วไป
                            </h2>
                            <p className="text-slate-500 mb-6">
                                สำหรับการจ้างงานทั่วไป
                            </p>
                            <div className="mt-auto">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                    2 เอกสาร
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* แบบสรุปโครงการ Card - แสดงเฉพาะแอดมิน */}
                {isAdmin && (
                    <div
                        className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-amber-200 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                        onClick={() => onSummarySelect()}
                    >
                        <div className="flex flex-col items-center text-center h-full">
                            <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                แบบสรุปโครงการ
                            </h2>
                            <p className="text-slate-500 mb-6">
                                สำหรับสรุปผลการดำเนินโครงการ
                            </p>
                            <div className="mt-auto">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                    1 เอกสาร
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ยื่นโครงการ Card - แสดงสำหรับทุกคน */}
                <div
                    className={`group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-pink-200 transition-all duration-300 cursor-pointer hover:-translate-y-1 ${
                        !isAdmin ? "w-full" : ""
                    }`}
                    onClick={() => onCategorySelect("project")}
                >
                    <div className="flex flex-col items-center text-center h-full">
                        <div className="p-4 rounded-2xl bg-pink-50 text-pink-500 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            เอกสารยื่นโครงการ
                        </h2>
                        <p className="text-slate-500 mb-6">
                            สำหรับการยื่นโครงการ
                        </p>
                        <div className="mt-auto">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                3 เอกสาร
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {selectedProjectId && (
                <div className="text-center mt-12">
                    <p className="text-slate-500">
                        หรือ{" "}
                        <button
                            onClick={() => {
                                router.push(
                                    `/uploads-doc?projectId=${encodeURIComponent(
                                        selectedProjectId
                                    )}`
                                );
                            }}
                            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                        >
                            อัพโหลดเอกสาร
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
};
