import React from "react";
import { Users, Shield } from "lucide-react";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: "member" | "admin";
}

interface UserStatsCardsProps {
    users: UserData[];
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ users }) => {
    const totalUsers = users.length;
    const adminCount = users.filter((user) => user.role === "admin").length;
    const memberCount = users.filter((user) => user.role === "member").length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Users Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-4">
                    <div className="text-primary bg-primary/10 p-3 rounded-full">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            ผู้ใช้ทั้งหมด
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {totalUsers}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            บัญชีผู้ใช้
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Users Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-4">
                    <div className="text-purple-500 bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                        <Shield className="h-8 w-8" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            ผู้ดูแลระบบ
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {adminCount}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            บัญชี Admin
                        </div>
                    </div>
                </div>
            </div>

            {/* Member Users Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-4">
                    <div className="text-info bg-info/10 p-3 rounded-full">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            สมาชิกทั่วไป
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {memberCount}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            บัญชี Member
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
