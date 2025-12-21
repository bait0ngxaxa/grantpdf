"use client";

interface CategorySubmenuProps {
    selectedCategory: string;
    isAdmin: boolean;
    onApprovalSelect: (templateId: string, title: string) => void;
    onTorSelect: (templateId: string, title: string) => void;
    onFormProjectSelect: (templateId: string, title: string) => void;
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
        // เฉพาะแอดมินเท่านั้นที่เข้าถึงได้
        if (!isAdmin) {
            // หาก user ทั่วไปพยายามเข้าถึง ให้กลับไปหน้าหลัก
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
                        onClick={() =>
                            onApprovalSelect(
                                "approval-letter",
                                "หนังสือขออนุมัติของมูลนิธิ"
                            )
                        }
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
                        onClick={() =>
                            onTorSelect("tor-general", "ขอบเขตของงาน (TOR)")
                        }
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
                                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                    />
                                </svg>
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
                        onClick={() =>
                            onFormProjectSelect(
                                "project-proposal",
                                "ข้อเสนอโครงการ"
                            )
                        }
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
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
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
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
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
                        onClick={() =>
                            onTorSelect("tor-project", "ขอบเขตของงาน (TOR)")
                        }
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
                                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                    />
                                </svg>
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
