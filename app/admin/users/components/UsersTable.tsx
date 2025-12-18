import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, Users } from "lucide-react";
import { Pagination } from "./Pagination";

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
    // Pagination props
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            รายการผู้ใช้งาน
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง (
                            {filteredCount} คน)
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="ค้นหาผู้ใช้งาน..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            />
                            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr className="text-lg text-gray-700 dark:text-gray-300">
                            <th className="px-6 py-4 text-left">ID</th>
                            <th className="px-6 py-4 text-left">ชื่อ</th>
                            <th className="px-6 py-4 text-left">อีเมล</th>
                            <th className="px-6 py-4 text-left">บทบาท</th>
                            <th className="px-6 py-4 text-left">วันที่สร้าง</th>
                            <th className="px-6 py-4 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-600"
                                >
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                                        {user.id}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                user.role === "admin"
                                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                            }`}
                                        >
                                            {user.role === "admin"
                                                ? "ผู้ดูแลระบบ"
                                                : "สมาชิก"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {new Date(
                                            user.created_at
                                        ).toLocaleDateString("th-TH")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2 justify-center">
                                            <Button
                                                size="sm"
                                                onClick={() => onEdit(user)}
                                                className="cursor-pointer rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                แก้ไข
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => onDelete(user)}
                                                className="cursor-pointer rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                ลบ
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                >
                                    <div className="flex flex-col items-center">
                                        <Users className="h-12 w-12 mb-4 text-gray-400" />
                                        <p className="text-lg font-medium">
                                            {searchTerm
                                                ? "ไม่พบผู้ใช้งานที่ค้นหา"
                                                : "ไม่พบผู้ใช้งาน"}
                                        </p>
                                        <p className="text-sm">
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
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredCount}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
            />
        </div>
    );
};
