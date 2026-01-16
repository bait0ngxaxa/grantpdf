import React from "react";
import { Users, Archive } from "lucide-react";
import type { AdminProject } from "@/type/models";

interface RecentActivityProps {
    totalUsers: number;
    latestProject: AdminProject | null;
    setActiveTab: (tab: string) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
    totalUsers,
    latestProject,
    setActiveTab,
}) => {
    return (
        <div className="space-y-6">
            {/* Users Card */}
            <div
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group h-fit"
                onClick={() => setActiveTab("users")}
            >
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">
                            ผู้ใช้งานทั้งหมด
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                            {totalUsers}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                            บัญชีผู้ใช้ในระบบ
                        </div>
                    </div>
                </div>
            </div>

            {/* Latest Project Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 h-fit">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                        <Archive className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-base font-bold text-slate-800">
                            โครงการล่าสุด
                        </div>
                        <div className="text-sm text-slate-500">
                            ที่เพิ่มเข้ามาในระบบ
                        </div>
                    </div>
                </div>

                {latestProject ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-sm font-medium text-slate-900 truncate mb-1">
                            {latestProject.name}
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>
                                สร้างโดย: {latestProject.userName || "ไม่ระบุ"}
                            </span>
                            <span>
                                {new Date(
                                    latestProject.created_at
                                ).toLocaleDateString("th-TH")}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-400 text-sm">
                        ยังไม่มีโครงการในระบบ
                    </div>
                )}
            </div>
        </div>
    );
};
