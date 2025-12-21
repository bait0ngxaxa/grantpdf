import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PROJECT_STATUS } from "@/type/models";
import { truncateFileName } from "@/lib/utils";
import type { Project } from "../hooks/useUserData";

interface DashboardOverviewProps {
    projects: Project[];
    totalDocuments: number;
    setActiveTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    projects,
    totalDocuments,
    setActiveTab,
}) => {
    const projectStatusCounts = useMemo(() => {
        const counts = {
            pending: 0,
            approved: 0,
            rejected: 0,
            editing: 0,
            closed: 0,
        };

        projects.forEach((project) => {
            const status = project.status || PROJECT_STATUS.IN_PROGRESS;
            switch (status) {
                case PROJECT_STATUS.IN_PROGRESS:
                    counts.pending++;
                    break;
                case PROJECT_STATUS.APPROVED:
                    counts.approved++;
                    break;
                case PROJECT_STATUS.REJECTED:
                    counts.rejected++;
                    break;
                case PROJECT_STATUS.EDIT:
                    counts.editing++;
                    break;
                case PROJECT_STATUS.CLOSED:
                    counts.closed++;
                    break;
            }
        });

        return counts;
    }, [projects]);

    return (
        <div className="animate-fade-in-up">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Projects Card */}
                <div className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-start space-x-4 relative z-10">
                        <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-500 mb-1">
                                โครงการทั้งหมด
                            </div>
                            <div className="text-3xl font-bold text-slate-800 mb-1">
                                {projects.length}
                            </div>
                            <div className="text-xs text-slate-400 mb-4">
                                โครงการที่คุณสร้าง
                            </div>

                            {/* Status Details */}
                            {projects.length > 0 && (
                                <div className="space-y-2.5 pt-2 border-t border-slate-50">
                                    <div className="flex items-center justify-between group/item">
                                        <div className="flex items-center">
                                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2.5"></div>
                                            <span className="text-xs font-medium text-slate-500 group-hover/item:text-slate-700 transition-colors">
                                                รอดำเนินการ
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full">
                                            {projectStatusCounts.pending}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between group/item">
                                        <div className="flex items-center">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2.5"></div>
                                            <span className="text-xs font-medium text-slate-500 group-hover/item:text-slate-700 transition-colors">
                                                อนุมัติแล้ว
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full">
                                            {projectStatusCounts.approved}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between group/item">
                                        <div className="flex items-center">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2.5"></div>
                                            <span className="text-xs font-medium text-slate-500 group-hover/item:text-slate-700 transition-colors">
                                                ไม่อนุมัติ
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full">
                                            {projectStatusCounts.rejected}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between group/item">
                                        <div className="flex items-center">
                                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2.5"></div>
                                            <span className="text-xs font-medium text-slate-500 group-hover/item:text-slate-700 transition-colors">
                                                ต้องแก้ไข
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full">
                                            {projectStatusCounts.editing}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between group/item">
                                        <div className="flex items-center">
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2.5"></div>
                                            <span className="text-xs font-medium text-slate-500 group-hover/item:text-slate-700 transition-colors">
                                                ปิดโครงการ
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full">
                                            {projectStatusCounts.closed}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Total Documents Card */}
                <div className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-start space-x-4 relative z-10">
                        <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-500 mb-1">
                                เอกสารทั้งหมด
                            </div>
                            <div className="text-3xl font-bold text-slate-800 mb-1">
                                {totalDocuments}
                            </div>
                            <div className="text-sm text-slate-400">
                                เอกสารจากทุุกโครงการ
                            </div>
                        </div>
                    </div>
                </div>

                {/* Latest Project Card */}
                <div className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-green-100/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-start space-x-4 relative z-10">
                        <div className="bg-green-50 text-green-600 p-3.5 rounded-2xl flex-shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="w-7 h-7 stroke-current"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-500 mb-1">
                                โครงการล่าสุด
                            </div>
                            <div className="text-2xl font-bold text-slate-800 mb-1 truncate">
                                {projects.length > 0
                                    ? truncateFileName(projects[0].name, 20)
                                    : "-"}
                            </div>
                            <div className="text-sm text-slate-400">
                                {projects.length > 0
                                    ? new Date(
                                          projects[0].created_at
                                      ).toLocaleDateString("th-TH")
                                    : "ยังไม่มีโครงการ"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>

                    <h3 className="text-xl font-bold mb-3 flex items-center text-slate-800">
                        <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3 shadow-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </span>
                        จัดการโครงการ
                    </h3>
                    <p className="text-slate-500 mb-6 pl-14">
                        ดูสถานะและจัดการเอกสารในโครงการทั้งหมดของคุณ
                    </p>
                    <Button
                        onClick={() => setActiveTab("projects")}
                        className="w-full h-12 rounded-xl bg-white border-2 border-slate-100 text-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        ดูโครงการทั้งหมด
                    </Button>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-8 rounded-3xl shadow-lg shadow-blue-500/20 relative overflow-hidden group hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <h3 className="text-xl font-bold mb-3 flex items-center">
                        <span className="bg-white/20 p-2 rounded-lg mr-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </span>
                        สร้างโครงการใหม่
                    </h3>
                    <p className="text-blue-50 mb-6 pl-14 opacity-90">
                        เริ่มสร้างโครงการใหม่เพื่อจัดการเอกสาร สัญญา และ TOR
                    </p>
                    <Button
                        onClick={() => setActiveTab("create")}
                        className="w-full h-12 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 hover:scale-[1.02] transition-all duration-300 shadow-lg border-0"
                    >
                        สร้างโครงการเลย
                    </Button>
                </div>
            </div>
        </div>
    );
};
