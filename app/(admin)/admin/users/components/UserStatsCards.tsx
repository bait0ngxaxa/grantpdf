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
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Users className="h-7 w-7" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                            ผู้ใช้ทั้งหมด
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800">
                            {totalUsers}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            บัญชีผู้ใช้ในระบบ
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Users Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                        <Shield className="h-7 w-7" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                            ผู้ดูแลระบบ
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800">
                            {adminCount}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            สิทธิ์การจัดการสูงสุด
                        </div>
                    </div>
                </div>
            </div>

            {/* Member Users Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Users className="h-7 w-7" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                            สมาชิกทั่วไป
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800">
                            {memberCount}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            ผู้ใช้งานทั่วไป
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
