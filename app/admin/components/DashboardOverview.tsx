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
        <div>
            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Projects Card */}
                <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <div className="flex items-center space-x-4">
                        <div className="text-blue-600 bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 stroke-current"
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
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                โครงการทั้งหมด
                            </div>
                            <div className="text-3xl font-bold text-blue-600">
                                {projects.length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                โครงการในระบบ
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's New Projects Card */}
                <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center space-x-4">
                        <div className="text-green-600 bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 stroke-current"
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
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                โครงการใหม่วันนี้
                            </div>
                            <div className="text-3xl font-bold text-green-600">
                                {todayProjects}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                โครงการที่สร้างวันนี้
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Documents Card */}
                <div
                    className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setActiveTab("documents")}
                >
                    <div className="flex items-center space-x-4">
                        <div className="text-purple-600 bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 stroke-current"
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
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                จำนวนเอกสาร
                            </div>
                            <div className="text-3xl font-bold text-purple-600">
                                {allFiles.length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                เอกสารทั้งหมดในระบบ
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's New Files Card */}
                <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center space-x-4">
                        <div className="text-orange-600 bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 stroke-current"
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
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                ไฟล์ใหม่วันนี้
                            </div>
                            <div className="text-3xl font-bold text-orange-600">
                                {todayFiles}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ไฟล์ที่เข้ามาวันนี้
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Project Status Statistics Card */}
                <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="text-purple-600 bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 stroke-current"
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
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                สถิติสถานะโครงการ
                            </div>
                            <div className="text-lg font-bold text-purple-600">
                                รายละเอียดสถานะ
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    กำลังดำเนินการ
                                </span>
                            </div>
                            <span className="font-bold text-yellow-600">
                                {projectStatusStats.pending}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    อนุมัติ
                                </span>
                            </div>
                            <span className="font-bold text-green-600">
                                {projectStatusStats.approved}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    ไม่อนุมัติ
                                </span>
                            </div>
                            <span className="font-bold text-red-600">
                                {projectStatusStats.rejected}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    แก้ไข
                                </span>
                            </div>
                            <span className="font-bold text-orange-600">
                                {projectStatusStats.editing}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    ปิดโครงการ
                                </span>
                            </div>
                            <span className="font-bold text-gray-600">
                                {projectStatusStats.closed}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Users Card */}
                <div
                    className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setActiveTab("users")}
                >
                    <div className="flex items-center space-x-4">
                        <div className="text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20 p-3 rounded-full">
                            <Users className="h-8 w-8 stroke-current" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                ผู้ใช้งานทั้งหมด
                            </div>
                            <div className="text-3xl font-bold text-indigo-600">
                                {totalUsers}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                บัญชีผู้ใช้ในระบบ
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Latest Project Card */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-100 transition-transform duration-300">
                    <div className="flex items-center space-x-4">
                        <div className="text-teal-600 bg-teal-100 dark:bg-teal-900/20 p-3 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 stroke-current"
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
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                โครงการล่าสุด
                            </div>
                            <div
                                className="text-lg font-bold truncate max-w-full text-teal-600"
                                title={latestProject?.name || ""}
                            >
                                {latestProject?.name || "ไม่มี"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {latestProject?.created_at
                                    ? new Date(
                                          latestProject.created_at
                                      ).toLocaleDateString("th-TH")
                                    : ""}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-primary"
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
                        การจัดการเอกสาร
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        ดู จัดการ และลบเอกสารทั้งหมดในระบบ
                    </p>
                    <Button
                        onClick={() => setActiveTab("documents")}
                        className="w-full cursor-pointer transform hover:scale-105 transition-transform duration-300"
                    >
                        เข้าสู่การจัดการเอกสาร
                    </Button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-primary"
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
                        การจัดการผู้ใช้งาน
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ
                    </p>
                    <Button
                        onClick={() => setActiveTab("users")}
                        className="w-full cursor-pointer transform hover:scale-105 transition-transform duration-300"
                        variant="outline"
                    >
                        เข้าสู่การจัดการผู้ใช้งาน
                    </Button>
                </div>
            </div>
        </div>
    );
};
