import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { ROUTES } from "@/lib/shared/constants";
import { Plus, Building2, FileText, Upload } from "lucide-react";

import { useUserDashboardContext } from "../contexts";

export const CreateProjectTab: React.FC = (): React.JSX.Element => {
    const { totalProjects, setShowCreateProjectModal } =
        useUserDashboardContext();
    const hasProjects = totalProjects > 0;

    return (
        <div className="animate-fade-in-up">
            <div className="rounded-2xl border border-blue-100/70 bg-white/90 p-6 text-center shadow-sm shadow-blue-100/50 backdrop-blur-xl transition-colors duration-200 dark:border-blue-900/35 dark:bg-slate-900/80 dark:shadow-none sm:p-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950/40 dark:text-blue-300">
                    <Plus className="h-8 w-8" />
                </div>

                {/* แสดงเนื้อหาแตกต่างกันตามว่ามีโครงการหรือไม่ */}
                {!hasProjects ? (
                    // กรณียังไม่มีโครงการ - แสดงเฉพาะปุ่มสร้างโครงการ
                    <>
                        <h3 className="mb-3 text-xl font-black text-slate-900 text-balance dark:text-slate-100 sm:text-2xl">
                            เริ่มต้นสร้างโครงการแรก
                        </h3>
                        <p className="mx-auto mb-6 max-w-xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                            ยินดีต้อนรับ!
                            เริ่มต้นด้วยการสร้างโครงการแรกของคุณเพื่อจัดการเอกสารอย่างเป็นระบบ
                        </p>
                        <div className="flex justify-center">
                            <Button
                                size="lg"
                                className="h-11 cursor-pointer rounded-xl border-0 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 px-5 font-bold text-white shadow-lg shadow-blue-500/20 transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:via-blue-600 hover:to-sky-600 hover:shadow-xl hover:shadow-blue-500/25"
                                onClick={() => setShowCreateProjectModal(true)}
                            >
                                <Building2 className="mr-2 h-5 w-5" />
                                สร้างโครงการแรกของฉัน
                            </Button>
                        </div>
                    </>
                ) : (
                    // กรณีมีโครงการแล้ว - แสดงปุ่มทั้งสาม
                    <>
                        <h3 className="mb-3 text-xl font-black text-slate-900 text-balance dark:text-slate-100 sm:text-2xl">
                            จัดการโครงการและเอกสาร
                        </h3>
                        <p className="mx-auto mb-6 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                            เริ่มต้นด้วยการสร้างโครงการใหม่
                            หรือเลือกโครงการที่มีอยู่แล้วเพื่อเพิ่มเอกสาร
                        </p>
                        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                            <Button
                                size="lg"
                                className="h-11 cursor-pointer rounded-xl bg-blue-600 px-5 font-bold text-white shadow-lg shadow-blue-500/20 transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/25"
                                onClick={() => setShowCreateProjectModal(true)}
                            >
                                <Building2 className="mr-2 h-5 w-5" />
                                สร้างโครงการใหม่
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                className="h-11 cursor-pointer rounded-xl bg-emerald-600 px-5 font-bold text-white shadow-lg shadow-emerald-500/20 transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/25"
                            >
                                <Link href={ROUTES.CREATE_DOCS}>
                                    <FileText className="mr-2 h-5 w-5" />
                                    สร้างเอกสารในโครงการ
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                className="h-11 cursor-pointer rounded-xl border border-blue-100 bg-blue-50 px-5 font-bold text-blue-700 shadow-sm transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:shadow-md dark:border-blue-900/50 dark:bg-blue-950/35 dark:text-blue-200 dark:hover:bg-blue-900/50"
                            >
                                <Link href="/uploads-doc">
                                    <Upload className="mr-2 h-5 w-5" />
                                    อัพโหลดเอกสาร
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
