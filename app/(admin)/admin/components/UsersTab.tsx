"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";

import {
    UserStatsCards,
    UsersTable,
    EditUserModal,
    DeleteUserModal,
} from "../users/components";
import { SuccessModal } from "@/components/ui";

import { useUserManagement } from "../users/hooks/useUserManagement";
import { usePagination } from "@/lib/hooks";
import { PAGINATION } from "@/lib/constants";
import { XCircle } from "lucide-react";

interface UsersTabProps {
    totalUsers?: number;
}

export const UsersTab: React.FC<UsersTabProps> = (): React.JSX.Element => {
    const { data: session, status } = useSession();
    const [searchTerm, setSearchTerm] = React.useState("");

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

    const pagination = usePagination({
        items: filteredUsers,
        itemsPerPage: PAGINATION.USERS_PER_PAGE,
    });

    useEffect(() => {
        pagination.resetPage();
    }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loadingUsers) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    return (
        <div>
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
};
