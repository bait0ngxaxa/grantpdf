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
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    การจัดการผู้ใช้งาน
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                    จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ ดู แก้ไข
                    และจัดการสิทธิ์การเข้าถึงของผู้ใช้
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                        <div className="text-2xl font-bold text-primary">
                            {totalUsers}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            ผู้ใช้งานทั้งหมด
                        </div>
                    </div>
                    <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                        <div className="text-2xl font-bold text-success">
                            {latestUser ? latestUser.name : "ไม่มีข้อมูล"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            สมาชิกล่าสุด
                        </div>
                        {latestUser && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(
                                    latestUser.created_at
                                ).toLocaleDateString("th-TH")}
                            </div>
                        )}
                    </div>
                    <div className="bg-info/10 p-4 rounded-lg border border-info/20">
                        <div className="text-2xl font-bold text-info">
                            {allFiles.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            เอกสารที่สร้าง
                        </div>
                    </div>
                </div>
                <Button
                    size="lg"
                    className="hover:bg-secondary-focus text-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
                    onClick={() => router.push("/admin/users")}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    เข้าสู่การจัดการผู้ใช้งาน
                </Button>
            </div>
        </div>
    );
};
