import React from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { AdminPdfFile, LatestUser } from "@/type/models";

interface UsersTabProps {
    totalUsers: number;
    latestUser: LatestUser | null;
    allFiles: AdminPdfFile[];
    router: AppRouterInstance;
}

export const UsersTab: React.FC<UsersTabProps> = ({
    totalUsers,
    latestUser,
    allFiles,
    router,
}) => {
    return (
        <div>
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 text-center max-w-4xl mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-200">
                    <Users className="h-10 w-10 text-white" />
                </div>

                <h3 className="text-3xl font-bold mb-4 text-slate-800">
                    การจัดการผู้ใช้งาน
                </h3>

                <p className="text-slate-500 mb-10 max-w-xl mx-auto text-lg">
                    จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ ดู แก้ไข
                    และจัดการสิทธิ์การเข้าถึงของผู้ใช้
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <div className="text-4xl font-extrabold text-blue-600 mb-2">
                            {totalUsers}
                        </div>
                        <div className="text-sm font-semibold text-blue-600/80 uppercase tracking-wide">
                            ผู้ใช้งานทั้งหมด
                        </div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <div className="text-lg font-bold text-emerald-700 truncate mb-1">
                            {latestUser ? latestUser.name : "-"}
                        </div>
                        <div className="text-xs font-semibold text-emerald-600/80 uppercase tracking-wide mb-1">
                            สมาชิกล่าสุด
                        </div>
                        {latestUser && (
                            <div className="text-xs text-emerald-600/60">
                                {new Date(
                                    latestUser.created_at
                                ).toLocaleDateString("th-TH")}
                            </div>
                        )}
                    </div>

                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                        <div className="text-4xl font-extrabold text-purple-600 mb-2">
                            {allFiles.length}
                        </div>
                        <div className="text-sm font-semibold text-purple-600/80 uppercase tracking-wide">
                            เอกสารที่สร้าง
                        </div>
                    </div>
                </div>

                <Button
                    size="lg"
                    className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl shadow-slate-200 text-lg font-medium transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => router.push("/admin/users")}
                >
                    <Users className="w-5 h-5 mr-3" />
                    เข้าสู่การจัดการผู้ใช้งาน
                </Button>
            </div>
        </div>
    );
};
