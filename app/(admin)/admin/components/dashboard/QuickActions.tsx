import React from "react";
import { FileText, User } from "lucide-react";
import { Button } from "@/components/ui";

interface QuickActionsProps {
    setActiveTab: (tab: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ setActiveTab }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold mb-4 flex items-center text-slate-800">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3 text-blue-600">
                        <FileText className="h-5 w-5" />
                    </div>
                    การจัดการเอกสาร
                </h3>
                <p className="text-slate-500 mb-6 text-sm">
                    ดู จัดการ และลบเอกสารทั้งหมดในระบบ
                </p>
                <Button
                    onClick={() => setActiveTab("documents")}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-11 font-medium"
                >
                    เข้าสู่การจัดการเอกสาร
                </Button>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold mb-4 flex items-center text-slate-800">
                    <div className="p-2 bg-indigo-50 rounded-lg mr-3 text-indigo-600">
                        <User className="h-5 w-5" />
                    </div>
                    การจัดการผู้ใช้งาน
                </h3>
                <p className="text-slate-500 mb-6 text-sm">
                    จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ
                </p>
                <Button
                    onClick={() => setActiveTab("users")}
                    className="w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 h-11 font-medium"
                    variant="outline"
                >
                    เข้าสู่การจัดการผู้ใช้งาน
                </Button>
            </div>
        </div>
    );
};
