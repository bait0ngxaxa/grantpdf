"use client";

import React from "react";
import { UserStatsCards } from "./UserStatsCards";
import { UsersTable } from "./UsersTable";
import { EditUserModal } from "./EditUserModal";
import { DeleteUserModal } from "./DeleteUserModal";
import { useUserManagement } from "../../hooks/useUserManagement";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { XCircle } from "lucide-react";

export const UsersTab: React.FC = (): React.JSX.Element => {
    const {
        total,
        roleCounts,
        users,
        totalPages,
        currentPage,
        setPage,
        searchTerm,
        setSearchTerm,
        loadingUsers,
        isInitialUsersLoading,
        fetchError,
        selectedUser,
        editFormData,
        isSaving,
        isDeleting,
        isEditModalOpen,
        isDeleteModalOpen,

        openEditModal,
        closeEditModal,
        handleEditFormChange,
        handleUpdateUser,
        openDeleteModal,
        closeDeleteModal,
        handleDeleteUser,
    } = useUserManagement();

    if (isInitialUsersLoading) {
        return <LoadingSpinner className="py-20" />;
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
            <UserStatsCards
                totalUsers={total}
                adminCount={roleCounts.admin}
                memberCount={roleCounts.member}
            />

            {loadingUsers ? (
                <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    Loading users...
                </div>
            ) : null}

            {/* Users Table */}
            <UsersTable
                users={users}
                filteredCount={total}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={10}
                onPageChange={setPage}
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
        </div>
    );
};
