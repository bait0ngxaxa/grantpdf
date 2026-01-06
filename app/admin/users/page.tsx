"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { useTitle } from "@/hooks/useTitle";

import { UsersSidebar } from "./components/UsersSidebar";
import { UsersTopBar } from "./components/UsersTopBar";
import { UserStatsCards } from "./components/UserStatsCards";
import { UsersTable } from "./components/UsersTable";
import { EditUserModal } from "./components/EditUserModal";
import { DeleteUserModal } from "./components/DeleteUserModal";
import { SuccessModal } from "../components/modals/SuccessModal";

import { useUserManagement } from "./hooks/useUserManagement";
import { usePagination } from "./hooks/usePagination";

const USERS_PER_PAGE = 10;

export default function AdminUserManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useTitle("จัดการผู้ใช้งาน | ระบบจัดการเอกสาร");

    // User management hook
    const {
        users,
        loadingUsers,
        fetchError,
        selectedUser,
        editFormData,
        isSaving,
        isDeleting,
        isEditModalOpen,
        isDeleteModalOpen,
        isResultModalOpen,
        resultMessage,
        isResultSuccess,
        fetchUsers,
        openEditModal,
        closeEditModal,
        handleEditFormChange,
        handleUpdateUser,
        openDeleteModal,
        closeDeleteModal,
        handleDeleteUser,
        closeResultModal,
    } = useUserManagement();

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user?.role !== "admin") {
            router.push("/access-denied");
        }
    }, [session, status, router]);

    // Ref to track if initial fetch has been done
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (
            status === "authenticated" &&
            session?.user?.role === "admin" &&
            !hasFetchedRef.current
        ) {
            hasFetchedRef.current = true;
            fetchUsers();
        }
    }, [status, session, fetchUsers]);

    const filteredUsers = useMemo(() => {
        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const pagination = usePagination(filteredUsers, {
        itemsPerPage: USERS_PER_PAGE,
    });

    useEffect(() => {
        pagination.resetPage();
    }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

    if (status === "loading" || loadingUsers) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (!session || session.user?.role !== "admin") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Sidebar */}
            <UsersSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                session={session}
                router={router}
            />

            {/* Main Content */}
            <div className="lg:ml-72 min-h-screen">
                {/* Top Bar */}
                <UsersTopBar
                    setIsSidebarOpen={setIsSidebarOpen}
                    userName={session.user?.name}
                    userRole={session.user?.role}
                    onSignOut={() => signOut()}
                />

                {/* Content Area */}
                <div className="p-6">
                    {/* Error Alert */}
                    {fetchError && (
                        <div
                            role="alert"
                            className="alert alert-error mb-6 bg-red-50 border border-red-200 text-red-800 rounded-2xl"
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
                    <UserStatsCards users={users} />

                    {/* Users Table */}
                    <UsersTable
                        users={pagination.paginatedItems}
                        filteredCount={filteredUsers.length}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onEdit={openEditModal}
                        onDelete={openDeleteModal}
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        itemsPerPage={pagination.itemsPerPage}
                        onPageChange={pagination.goToPage}
                    />
                </div>
            </div>

            {/* Modals */}
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                user={selectedUser}
                editFormData={editFormData}
                onFormChange={handleEditFormChange}
                onSubmit={handleUpdateUser}
                isSaving={isSaving}
            />

            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                user={selectedUser}
                isDeleting={isDeleting}
                onConfirm={handleDeleteUser}
            />

            <SuccessModal
                isSuccessModalOpen={isResultModalOpen}
                setIsSuccessModalOpen={closeResultModal}
                successMessage={
                    isResultSuccess
                        ? resultMessage
                        : `ข้อผิดพลาด: ${resultMessage}`
                }
            />
        </div>
    );
}
