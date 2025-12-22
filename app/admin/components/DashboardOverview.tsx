import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import type { AdminProject, AdminPdfFile } from "@/type/models";
import { PROJECT_STATUS } from "@/type/models";

interface DashboardOverviewProps {
    projects: AdminProject[];
    allFiles: AdminPdfFile[];
    totalUsers: number;
    todayProjects: number;
    todayFiles: number;
    setActiveTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    projects,
    allFiles,
    totalUsers,
    todayProjects,
    todayFiles,
    setActiveTab,
}) => {
    // Calculate latest project
    const latestProject = useMemo(() => {
        const sortedProjects = projects.sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        );
        return sortedProjects.length > 0 ? sortedProjects[0] : null;
    }, [projects]);

    // Calculate project status statistics
    const projectStatusStats = useMemo(() => {
        const stats = {
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
                    stats.pending++;
                    break;
                case PROJECT_STATUS.APPROVED:
                    stats.approved++;
                    break;
                case PROJECT_STATUS.REJECTED:
                    stats.rejected++;
                    break;
                case PROJECT_STATUS.EDIT:
                    stats.editing++;
                    break;
                case PROJECT_STATUS.CLOSED:
                    stats.closed++;
                    break;
            }
        });

        return stats;
    }, [projects]);

    return (
        <div className="space-y-6">
            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Projects Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
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
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">
                                โครงการทั้งหมด
                            </div>
                            <div className="text-2xl font-bold text-slate-800">
                                {projects.length}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                                โครงการในระบบ
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's New Projects Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
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
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">
                                โครงการใหม่วันนี้
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                                {todayProjects}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                                โครงการที่สร้างวันนี้
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Documents Card */}
                <div
                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                    onClick={() => setActiveTab("documents")}
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
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
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">
                                จำนวนเอกสาร
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                                {allFiles.length}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                                เอกสารทั้งหมดในระบบ
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's New Files Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
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
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">
                                ไฟล์ใหม่วันนี้
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                                {todayFiles}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                                ไฟล์ที่เข้ามาวันนี้
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Status Statistics Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
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
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="text-base font-bold text-slate-800">
                                รายละเอียดสถานะโครงการ
                            </div>
                            <div className="text-sm text-slate-500">
                                ภาพรวมสถานะทั้งหมด
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-sm shadow-yellow-200"></div>
                                <span className="text-sm font-medium text-slate-600">
                                    กำลังดำเนินการ
                                </span>
                            </div>
                            <span className="font-bold text-slate-800">
                                {projectStatusStats.pending}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm shadow-green-200"></div>
                                <span className="text-sm font-medium text-slate-600">
                                    อนุมัติแล้ว
                                </span>
                            </div>
                            <span className="font-bold text-slate-800">
                                {projectStatusStats.approved}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm shadow-red-200"></div>
                                <span className="text-sm font-medium text-slate-600">
                                    ไม่อนุมัติ
                                </span>
                            </div>
                            <span className="font-bold text-slate-800">
                                {projectStatusStats.rejected}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-sm shadow-orange-200"></div>
                                <span className="text-sm font-medium text-slate-600">
                                    แก้ไข
                                </span>
                            </div>
                            <span className="font-bold text-slate-800">
                                {projectStatusStats.editing}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-2.5 h-2.5 bg-slate-500 rounded-full shadow-sm shadow-slate-200"></div>
                                <span className="text-sm font-medium text-slate-600">
                                    ปิดโครงการ
                                </span>
                            </div>
                            <span className="font-bold text-slate-800">
                                {projectStatusStats.closed}
                            </span>
                        </div>
                    </div>
                </div>

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
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
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
                                        สร้างโดย:{" "}
                                        {latestProject.userName || "ไม่ระบุ"}
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
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-lg font-bold mb-4 flex items-center text-slate-800">
                        <div className="p-2 bg-blue-50 rounded-lg mr-3 text-blue-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
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
        </div>
    );
};
