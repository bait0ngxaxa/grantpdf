"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTitle } from "@/hook/useTitle";
import {
    Users,
    Folder,
    FileText,
    Settings,
    Menu,
    X,
    Shield,
    LogOut,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
} from "lucide-react";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: "member" | "admin";
    created_at: string;
}

export default function AdminUserManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null); //

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        email: "",
        role: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const [isResultSuccess, setIsResultSuccess] = useState(true);
    useTitle("จัดการผู้ใช้งาน | ระบบจัดการเอกสาร");

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user?.role !== "admin") {
            router.push("/access-denied");
        }
    }, [session, status, router]);

    // --- Fetch Users from API ---
    const fetchUsers = async () => {
        setLoadingUsers(true);
        setFetchError(null);
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to fetch users");
            }
            const data = await res.json();

            const processedUsers = data.users.map((user: any) => ({
                ...user,
                id: user.id.toString(),
                createdAt: new Date(user.createdAt).toLocaleDateString("th-TH"),
            }));
            setUsers(processedUsers);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            setFetchError(error.message || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role === "admin") {
            fetchUsers();
        }
    }, [status, session]); //

    const openEditModal = (user: UserData) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            role: user.role,
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setEditFormData({ name: "", email: "", role: "" });
    };

    const handleEditFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setEditFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleUpdateUser = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editFormData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update user");
            }

            await fetchUsers();
            closeEditModal();

            setResultMessage("อัปเดตข้อมูลผู้ใช้สำเร็จ!");
            setIsResultSuccess(true);
            setIsResultModalOpen(true);
        } catch (error: any) {
            console.error("Failed to update user:", error);

            setResultMessage(
                error.message || "เกิดข้อผิดพลาดในการอัปเดตผู้ใช้"
            );
            setIsResultSuccess(false);
            setIsResultModalOpen(true);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Delete Modal Functions ---
    const openDeleteModal = (user: UserData) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete user");
            }

            await fetchUsers();
            closeDeleteModal();

            // Show success modal instead of alert
            setResultMessage("ลบผู้ใช้สำเร็จ!");
            setIsResultSuccess(true);
            setIsResultModalOpen(true);
        } catch (error: any) {
            console.error("Failed to delete user:", error);

            // Show error modal instead of alert
            setResultMessage(error.message || "เกิดข้อผิดพลาดในการลบผู้ใช้");
            setIsResultSuccess(false);
            setIsResultModalOpen(true);
        } finally {
            setIsDeleting(false);
        }
    };

    // Menu items for admin sidebar
    const menuItems = [
        {
            id: "dashboard",
            name: "ภาพรวมระบบ",
            href: "/admin",
            icon: <Folder className="h-5 w-5" />,
        },
        {
            id: "documents",
            name: "จัดการเอกสาร",
            href: "/admin",
            icon: <FileText className="h-5 w-5" />,
        },
        {
            id: "users",
            name: "จัดการผู้ใช้งาน",
            href: "/admin/users",
            icon: <Users className="h-5 w-5" />,
        },
    ];

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (status === "loading" || loadingUsers) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (!session || session.user?.role !== "admin") {
        return null; // Redirect handled by useEffect
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-50 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <Settings className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-primary">
                                    Admin Panel
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    ระบบจัดการ
                                </p>
                            </div>
                        </div>
                        <button
                            className="lg:hidden btn btn-ghost btn-sm"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={item.href}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left ${
                                        item.id === "users"
                                            ? "bg-primary text-white shadow-md"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    {item.icon}
                                    <span className="font-medium">
                                        {item.name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                                {session.user?.name?.charAt(0) ||
                                    session.user?.email?.charAt(0) ||
                                    "A"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-m font-medium text-gray-900 dark:text-white truncate">
                                {session.user?.name || "Admin"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {session.user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => router.push("/userdashboard")}
                            className="flex-1  transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                        >
                            กลับ Dashboard
                        </Button>
                        <button
                            onClick={() => signOut()}
                            className="flex-1 text-xs btn btn-ghost btn-sm text-red-600 dark:text-red-400 hover:text-red-500"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen">
                {/* Top Bar */}
                <div className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                className="lg:hidden btn btn-ghost btn-sm"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                จัดการผู้ใช้งาน
                            </h1>
                        </div>
                        <div className="hidden sm:flex items-center space-x-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {session.user?.name} ({session.user?.role})
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transform hover:scale-105 transition-transform duration-300"
                                onClick={() => signOut()}
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                ออกจากระบบ
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    {/* Error Alert */}
                    {fetchError && (
                        <div
                            role="alert"
                            className="alert alert-error mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="stroke-current shrink-0 h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span>{fetchError}</span>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ">
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
                                        {users.length}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        บัญชีผู้ใช้
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center space-x-4 ">
                                <div className="text-purple-500 bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                                    <Shield className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        ผู้ดูแลระบบ
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {
                                            users.filter(
                                                (user) => user.role === "admin"
                                            ).length
                                        }
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        บัญชี Admin
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center space-x-4 ">
                                <div className="text-info bg-info/10 p-3 rounded-full">
                                    <Users className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        สมาชิกทั่วไป
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {
                                            users.filter(
                                                (user) => user.role === "member"
                                            ).length
                                        }
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        บัญชี Member
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                รายการผู้ใช้งาน
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr className="text-lg text-gray-700 dark:text-gray-300">
                                        <th className="px-6 py-4 text-left">
                                            ID
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            ชื่อ
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            อีเมล
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            บทบาท
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            วันที่สร้าง
                                        </th>
                                        <th className="px-6 py-4 text-center">
                                            จัดการ
                                        </th>
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
                                                            user.role ===
                                                            "admin"
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
                                                    ).toLocaleDateString(
                                                        "th-TH"
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex space-x-2 justify-center">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    user
                                                                )
                                                            }
                                                            className="cursor-pointer rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            แก้ไข
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    user
                                                                )
                                                            }
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
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-12 w-12 mb-4 text-gray-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197a4 4 0 11-7.32 0l3.66 1.83z"
                                                        />
                                                    </svg>
                                                    <p className="text-lg font-medium">
                                                        ไม่พบผู้ใช้งาน
                                                    </p>
                                                    <p className="text-sm">
                                                        ยังไม่มีผู้ใช้งานในระบบ
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <dialog className="modal modal-open">
                    <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                            แก้ไขผู้ใช้งาน: {selectedUser.name}
                        </h3>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    ชื่อ
                                </label>
                                <Input
                                    type="text"
                                    name="name"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    value={editFormData.name}
                                    onChange={handleEditFormChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    อีเมล
                                </label>
                                <Input
                                    type="email"
                                    name="email"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white opacity-50"
                                    value={editFormData.email}
                                    onChange={handleEditFormChange}
                                    required
                                    disabled
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    อีเมลไม่สามารถแก้ไขได้
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    บทบาท
                                </label>
                                <select
                                    name="role"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    value={editFormData.role}
                                    onChange={handleEditFormChange}
                                    required
                                >
                                    <option value="member">สมาชิก</option>
                                    <option value="admin">ผู้ดูแลระบบ</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 cursor-pointer"
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-primary hover:bg-primary-focus text-white cursor-pointer"
                                >
                                    {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                                </Button>
                            </div>
                        </form>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={closeEditModal}>ปิด</button>
                    </form>
                </dialog>
            )}

            {/* Delete User Modal */}
            {isDeleteModalOpen && selectedUser && (
                <dialog className="modal modal-open">
                    <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
                        <h3 className="font-bold text-lg text-red-600 mb-4">
                            ยืนยันการลบผู้ใช้งาน
                        </h3>
                        <div className="py-4">
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน{" "}
                                <strong className="text-gray-900 dark:text-white">
                                    {selectedUser.name}
                                </strong>{" "}
                                ({selectedUser.email})?
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                การกระทำนี้ไม่สามารถย้อนกลับได้
                            </p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={closeDeleteModal}
                                className="cursor-pointer px-4 py-2"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={handleDeleteUser}
                                disabled={isDeleting}
                                className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isDeleting ? "กำลังลบ..." : "ลบ"}
                            </Button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={closeDeleteModal}>ปิด</button>
                    </form>
                </dialog>
            )}

            {/* Result Modal (Success/Error) */}
            {isResultModalOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
                        <div className="flex flex-col items-center text-center">
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                    isResultSuccess
                                        ? "bg-green-100 dark:bg-green-900/20"
                                        : "bg-red-100 dark:bg-red-900/20"
                                }`}
                            >
                                {isResultSuccess ? (
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                ) : (
                                    <XCircle className="h-8 w-8 text-red-600" />
                                )}
                            </div>
                            <h3
                                className={`font-bold text-lg mb-2 ${
                                    isResultSuccess
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {isResultSuccess
                                    ? "สำเร็จ!"
                                    : "เกิดข้อผิดพลาด!"}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-6">
                                {resultMessage}
                            </p>
                            <Button
                                onClick={() => setIsResultModalOpen(false)}
                                className={`w-full ${
                                    isResultSuccess
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                } text-white`}
                            >
                                ตกลง
                            </Button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setIsResultModalOpen(false)}>
                            ปิด
                        </button>
                    </form>
                </dialog>
            )}
        </div>
    );
}
