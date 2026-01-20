"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { useTitle, usePagination } from "@/lib/hooks";
import { PAGINATION } from "@/lib/constants";
import { XCircle } from "lucide-react";

import {
    UsersSidebar,
    UsersTopBar,
    UserStatsCards,
    UsersTable,
    EditUserModal,
    DeleteUserModal,
} from "./components";
import { SuccessModal } from "@/components/ui";

import { useUserManagement } from "./hooks/useUserManagement";

export default function AdminUserManagementPage(): React.JSX.Element | null {
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
                user.email.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [users, searchTerm]);

    const pagination = usePagination({
        items: filteredUsers,
        itemsPerPage: PAGINATION.USERS_PER_PAGE,
    });

    useEffect(() => {
        pagination.resetPage();
    }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

    if (status === "loading" || loadingUsers) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    if (!session || session.user?.role !== "admin") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100">
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
                    onSignOut={() => signOut({ callbackUrl: "/signin" })}
                />

                {/* Content Area */}
                <div className="p-6">
                    {/* Error Alert */}
                    {fetchError && (
                        <div
                            role="alert"
                            className="alert alert-error mb-6 bg-red-50 border border-red-200 text-red-800 rounded-2xl"
                        >
                            <XCircle className="stroke-current shrink-0 h-6 w-6" />
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
                isOpen={isResultModalOpen}
                onClose={closeResultModal}
                message={
                    isResultSuccess
                        ? resultMessage
                        : `ข้อผิดพลาด: ${resultMessage}`
                }
            />
        </div>
    );
}
