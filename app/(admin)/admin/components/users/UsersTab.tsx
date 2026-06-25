"use client";

import React from "react";
import { UserStatsCards } from "./UserStatsCards";
import { UsersTable } from "./UsersTable";
import { EditUserModal } from "./EditUserModal";
import { DeleteUserModal } from "./DeleteUserModal";
import { useUserManagement } from "../../hooks/useUserManagement";
import { Skeleton, TableSkeleton } from "@/components/ui";
import { XCircle } from "lucide-react";

const USER_STAT_SKELETONS = [1, 2, 3] as const;

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
        canSaveEdit,
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
        return (
            <div className="space-y-6">
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {USER_STAT_SKELETONS.map((item) => (
                        <div
                            key={item}
                            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                        >
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-3 w-36" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <TableSkeleton withToolbar columns={6} rows={4} />
            </div>
        );
    }

    return (
        <div>
            {/* Error Alert */}
            {fetchError && (
                <div
                    role="alert"
                    className="alert alert-error mb-6 rounded-2xl border border-red-200 bg-red-50 text-red-800"
                >
                    <XCircle className="h-6 w-6 shrink-0 stroke-current" />
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
                canSave={canSaveEdit}
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
