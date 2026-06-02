import React from "react";
import { FileText, User } from "lucide-react";
import { Button } from "@/components/ui";

interface QuickActionsProps {
    setActiveTab: (tab: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ setActiveTab }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-blue-100/70 bg-white/90 p-5 shadow-sm shadow-blue-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-blue-100/60 dark:border-blue-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900 sm:p-6">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-300/70 to-transparent" />
                <h3 className="relative z-10 mb-3 flex min-w-0 items-center gap-3 break-words text-base font-black text-slate-900 text-balance dark:text-slate-100 sm:text-lg">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/40 dark:text-blue-300">
                        <FileText className="h-5 w-5" />
                    </div>
                    การจัดการเอกสาร
                </h3>
                <p className="relative z-10 mb-5 break-words text-sm font-medium leading-6 text-slate-500 dark:text-slate-400 sm:pl-14">
                    ดู จัดการ และลบเอกสารทั้งหมดในระบบ
                </p>
                <Button
                    onClick={() => setActiveTab("documents")}
                    className="relative z-10 h-11 w-full rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20 transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/25"
                >
                    เข้าสู่การจัดการเอกสาร
                </Button>
            </div>
            <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-indigo-100/70 bg-white/90 p-5 shadow-sm shadow-indigo-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/60 dark:border-indigo-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900 sm:p-6">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-300/70 to-transparent" />
                <h3 className="relative z-10 mb-3 flex min-w-0 items-center gap-3 break-words text-base font-black text-slate-900 text-balance dark:text-slate-100 sm:text-lg">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/40 dark:text-indigo-300">
                        <User className="h-5 w-5" />
                    </div>
                    การจัดการผู้ใช้งาน
                </h3>
                <p className="relative z-10 mb-5 break-words text-sm font-medium leading-6 text-slate-500 dark:text-slate-400 sm:pl-14">
                    จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ
                </p>
                <Button
                    onClick={() => setActiveTab("users")}
                    className="relative z-10 h-11 w-full rounded-xl border border-indigo-100 bg-indigo-50 font-bold text-indigo-700 shadow-sm transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 hover:shadow-md dark:border-indigo-900/50 dark:bg-indigo-950/35 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
                    variant="outline"
                >
                    เข้าสู่การจัดการผู้ใช้งาน
                </Button>
            </div>
        </div>
    );
};
