import React from "react";
import { Button, Pagination } from "@/components/ui";
import { Edit, Trash2, Search, Users } from "lucide-react";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: "member" | "admin";
    created_at: string;
}

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
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            รายการผู้ใช้งาน
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง (
                            {filteredCount} คน)
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                placeholder="ค้นหาผู้ใช้งาน..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead className="bg-slate-50/50">
                        <tr className="text-sm font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                            <th className="px-6 py-4 text-left">ID</th>
                            <th className="px-6 py-4 text-left">ชื่อ</th>
                            <th className="px-6 py-4 text-left">อีเมล</th>
                            <th className="px-6 py-4 text-left">บทบาท</th>
                            <th className="px-6 py-4 text-left">วันที่สร้าง</th>
                            <th className="px-6 py-4 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-slate-50/50 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4 font-mono text-sm text-slate-400">
                                        {user.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-slate-800">
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${
                                                user.role === "admin"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {user.role === "admin"
                                                ? "Admin"
                                                : "Member"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {new Date(
                                            user.created_at
                                        ).toLocaleDateString("th-TH")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2 justify-center">
                                            <Button
                                                size="sm"
                                                onClick={() => onEdit(user)}
                                                className="h-8 w-8 p-0 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 shadow-sm"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => onDelete(user)}
                                                className="h-8 w-8 p-0 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 shadow-sm"
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
                                    className="px-6 py-12 text-center text-slate-500"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Users className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <p className="text-lg font-medium text-slate-800">
                                            {searchTerm
                                                ? "ไม่พบผู้ใช้งานที่ค้นหา"
                                                : "ไม่พบผู้ใช้งาน"}
                                        </p>
                                        <p className="text-sm mt-1 text-slate-400">
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
            <div className="bg-white border-t border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-500">
                    แสดง{" "}
                    {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        filteredCount
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
