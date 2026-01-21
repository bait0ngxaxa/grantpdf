"use client";

import { FileText } from "lucide-react";
import { useCreateDocsContext } from "../CreateDocsContext";

export const ContractTypeSubmenu = (): React.JSX.Element => {
    const { handleContractSelection } = useCreateDocsContext();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">
                สัญญาจ้างปฏิบัติงานวิชาการ
            </h1>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
                เลือกประเภทสัญญาที่ต้องการสร้าง
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                <div
                    className="group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                    onClick={() => handleContractSelection("ABS")}
                >
                    <div className="flex flex-col items-center text-center h-full">
                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <FileText className="h-12 w-12" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-blue-600 mb-2">
                            ABS
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            สัญญาจ้างประเภท ABS
                        </p>
                        <div className="mt-auto">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                รหัส: ABS
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    className="group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                    onClick={() => handleContractSelection("DMR")}
                >
                    <div className="flex flex-col items-center text-center h-full">
                        <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                            <FileText className="h-12 w-12" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-green-600 mb-2">
                            DMR
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            สัญญาจ้างประเภท DMR
                        </p>
                        <div className="mt-auto">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800">
                                รหัส: DMR
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    className="group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                    onClick={() => handleContractSelection("SIP")}
                >
                    <div className="flex flex-col items-center text-center h-full">
                        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                            <FileText className="h-12 w-12" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-purple-600 mb-2">
                            SIP
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            สัญญาจ้างประเภท SIP
                        </p>
                        <div className="mt-auto">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                                รหัส: SIP
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
