import React from "react";
import { cn, getAvatarInitial } from "@/lib/shared/utils";
import { Button, Pagination } from "@/components/ui";
import { Edit, Trash2, Search, Users } from "lucide-react";
import { ROLES } from "@/lib/shared/constants";
import type { UserApiData } from "@/type";

type UserData = UserApiData;

interface UsersTableProps {
    users: UserData[];
    filteredCount: number;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onEdit: (user: UserData) => void;
    onDelete: (user: UserData) => void;

    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
    users,
    filteredCount,
    searchTerm,
    onSearchChange,
    onEdit,
    onDelete,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
}) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:rounded-3xl">
            {/* Header */}
            <div className="border-b border-slate-100 p-4 dark:border-slate-700 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-balance">
                            รายการผู้ใช้งาน
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง (
                            {filteredCount} คน)
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                aria-label="ค้นหาผู้ใช้งาน"
                                placeholder="ค้นหาผู้ใช้งาน…"
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors font-medium"
                            />
                            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead className="bg-slate-50/50 dark:bg-slate-700/50">
                        <tr className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                            <th className="px-4 py-3 text-left sm:px-6 sm:py-4">ID</th>
                            <th className="px-4 py-3 text-left sm:px-6 sm:py-4">ชื่อ</th>
                            <th className="px-4 py-3 text-left sm:px-6 sm:py-4">อีเมล</th>
                            <th className="px-4 py-3 text-left sm:px-6 sm:py-4">บทบาท</th>
                            <th className="px-4 py-3 text-left sm:px-6 sm:py-4">วันที่สร้าง</th>
                            <th className="px-4 py-3 text-center sm:px-6 sm:py-4">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                                >
                                    <td className="px-4 py-3 font-mono text-sm text-slate-400 dark:text-slate-500 sm:px-6 sm:py-4">
                                        {user.id}
                                    </td>
                                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                                {getAvatarInitial(
                                                    user.name,
                                                    user.email,
                                                    "U",
                                                )}
                                            </div>
                                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 sm:px-6 sm:py-4">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                                        <span
                                            className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide",
                                                user.role === ROLES.ADMIN
                                                    ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400"
                                                    : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400",
                                            )}
                                        >
                                            {user.role === ROLES.ADMIN
                                                ? "Admin"
                                                : "Member"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 sm:px-6 sm:py-4">
                                        {new Date(
                                            user.created_at,
                                        ).toLocaleDateString("th-TH")}
                                    </td>
                                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                                        <div className="flex space-x-2 justify-center">
                                            <Button
                                                size="sm"
                                                onClick={() => onEdit(user)}
                                                aria-label={`แก้ไขผู้ใช้งาน ${user.name}`}
                                                className="h-11 w-11 rounded-lg border border-slate-200 bg-white p-0 text-slate-500 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:border-blue-800 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 sm:h-8 sm:w-8"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => onDelete(user)}
                                                aria-label={`ลบผู้ใช้งาน ${user.name}`}
                                                className="h-11 w-11 rounded-lg border border-slate-200 bg-white p-0 text-slate-500 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-400 sm:h-8 sm:w-8"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                            <Users className="h-8 w-8 text-slate-300 dark:text-slate-500" />
                                        </div>
                                        <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                                            {searchTerm
                                                ? "ไม่พบผู้ใช้งานที่ค้นหา"
                                                : "ไม่พบผู้ใช้งาน"}
                                        </p>
                                        <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">
                                            {searchTerm
                                                ? `ไม่พบผู้ใช้งานที่ตรงกับ "${searchTerm}"`
                                                : "ยังไม่มีผู้ใช้งานในระบบ"}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    แสดง{" "}
                    {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        filteredCount,
                    )}{" "}
                    - {Math.min(currentPage * itemsPerPage, filteredCount)} จาก{" "}
                    {filteredCount} รายการ
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
};
