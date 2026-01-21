import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { Plus, Building2, FileText, Upload } from "lucide-react";

import { useUserDashboardContext } from "../contexts";

export const CreateProjectTab: React.FC = (): React.JSX.Element => {
    const { projects, setShowCreateProjectModal } = useUserDashboardContext();
    const router = useRouter(); // Router still needed or provided by component?
    return (
        <div className="animate-fade-in-up">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-10 text-center transition-colors duration-200">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Plus className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                </div>

                {/* แสดงเนื้อหาแตกต่างกันตามว่ามีโครงการหรือไม่ */}
                {projects.length === 0 ? (
                    // กรณียังไม่มีโครงการ - แสดงเฉพาะปุ่มสร้างโครงการ
                    <>
                        <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-100">
                            เริ่มต้นสร้างโครงการแรก
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
                            ยินดีต้อนรับ!
                            เริ่มต้นด้วยการสร้างโครงการแรกของคุณเพื่อจัดการเอกสารอย่างเป็นระบบ
                        </p>
                        <div className="flex justify-center">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 cursor-pointer transform hover:scale-105 transition-all duration-300 px-8 py-6 h-auto text-lg rounded-xl border-0"
                                onClick={() => setShowCreateProjectModal(true)}
                            >
                                <Building2 className="h-6 w-6 mr-3" />
                                สร้างโครงการแรกของฉัน
                            </Button>
                        </div>
                    </>
                ) : (
                    // กรณีมีโครงการแล้ว - แสดงปุ่มทั้งสาม
                    <>
                        <h3 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                            จัดการโครงการและเอกสาร
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto text-lg">
                            เริ่มต้นด้วยการสร้างโครงการใหม่
                            หรือเลือกโครงการที่มีอยู่แล้วเพื่อเพิ่มเอกสาร
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 cursor-pointer transform hover:scale-105 transition-all duration-300 h-14 rounded-xl px-8"
                                onClick={() => setShowCreateProjectModal(true)}
                            >
                                <Building2 className="h-5 w-5 mr-2" />
                                สร้างโครงการใหม่
                            </Button>
                            <Button
                                size="lg"
                                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 cursor-pointer transform hover:scale-105 transition-all duration-300 h-14 rounded-xl px-8"
                                onClick={() => router.push(ROUTES.CREATE_DOCS)}
                            >
                                <FileText className="h-5 w-5 mr-2" />
                                สร้างเอกสารในโครงการ
                            </Button>
                            <Button
                                size="lg"
                                className="bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 shadow-sm cursor-pointer transform hover:scale-105 transition-all duration-300 h-14 rounded-xl px-8"
                                onClick={() => router.push("/uploads-doc")}
                            >
                                <Upload className="h-5 w-5 mr-2" />
                                อัพโหลดเอกสาร
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
