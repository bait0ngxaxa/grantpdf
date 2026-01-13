"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { useTitle } from "@/lib/hooks/useTitle";

import { useAdminData } from "./hooks/useAdminData";
import { useProjectStatusActions } from "./hooks/useProjectStatusActions";
import { usePreviewModal, useSuccessModal } from "./hooks/useModalStates";
import { useUIStates } from "./hooks/useUIStates";
import { useAdminProjectFilter } from "./hooks/useAdminProjectFilter";

import { AdminSidebar } from "./components/AdminSidebar";
import { AdminTopBar } from "./components/AdminTopBar";
import { DashboardOverview } from "./components/DashboardOverview";
import { UsersTab } from "./components/UsersTab";

import SearchAndFilter from "./components/SearchAndFilter";
import ProjectsList from "./components/ProjectsList";

import { SuccessModal } from "./components/modals/SuccessModal";
import { PreviewModal } from "./components/modals/PreviewModal";
import { ProjectStatusModal } from "./components/modals/ProjectStatusModal";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";

// Import shared types and constants
import { PAGINATION } from "@/lib/constants";
import { getStatusColor } from "@/lib/utils";

const itemsPerPage = PAGINATION.ITEMS_PER_PAGE;

const getTitleByTab = (tab: string) => {
    switch (tab) {
        case "dashboard":
            return "Admin Dashboard - ภาพรวมระบบ | ระบบจัดการเอกสาร";
        case "documents":
            return "Admin Dashboard - จัดการโครงการและเอกสาร | ระบบจัดการเอกสาร";
        case "users":
            return "Admin Dashboard - จัดการผู้ใช้งาน | ระบบจัดการเอกสาร";
        default:
            return "Admin Dashboard | ระบบจัดการเอกสาร";
    }
};

export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const {
        projects,
        setProjects,
        orphanFiles,

        isLoading,
        totalUsers,
        latestUser,
        todayProjects,
        todayFiles,
        fetchProjects,
    } = useAdminData();

    const {
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        expandedProjects,
        viewedProjects,

        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        selectedFileType,
        selectedStatus,
        setSelectedStatus,
        toggleProjectExpansion,
    } = useUIStates();

    const {
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        successMessage,
        setSuccessMessage,
    } = useSuccessModal();

    const {
        isPreviewModalOpen,
        previewUrl,
        previewFileName,
        openPreviewModal,
        closePreviewModal,
    } = usePreviewModal();

    const {
        isStatusModalOpen,
        selectedProjectForStatus,
        newStatus,
        setNewStatus,
        statusNote,
        setStatusNote,
        isUpdatingStatus,
        openStatusModal,
        closeStatusModal,
        handleUpdateProjectStatus,
    } = useProjectStatusActions(
        setProjects,
        setSuccessMessage,
        setIsSuccessModalOpen
    );

    useTitle(getTitleByTab(activeTab));

    // Ref to track if initial fetch has been done
    const hasFetchedRef = React.useRef(false);

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user?.role !== "admin") {
            router.push("/access-denied");
        }
    }, [session, status, router]);

    useEffect(() => {
        if (
            session &&
            session.user?.role === "admin" &&
            !hasFetchedRef.current
        ) {
            hasFetchedRef.current = true;
            fetchProjects(session);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    const filteredAndSortedProjects = useAdminProjectFilter({
        projects,
        orphanFiles,
        searchTerm,
        selectedFileType,
        selectedStatus,
        sortBy,
    });

    const allFiles = useMemo(() => {
        return [...orphanFiles, ...projects.flatMap((p) => p.files)];
    }, [orphanFiles, projects]);

    // Pagination
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems: paginatedProjects,
        startIndex,
        endIndex,
        totalItems,
    } = usePagination({
        items: filteredAndSortedProjects.projects,
        itemsPerPage,
    });

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="flex flex-col items-center space-y-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="text-gray-600 dark:text-gray-400">
                        กำลังโหลดข้อมูล...
                    </p>
                </div>
            </div>
        );
    }

    if (!session || session.user?.role !== "admin") {
        return null;
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
                <AdminSidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    session={session}
                    router={router}
                    todayProjects={todayProjects}
                    todayFiles={todayFiles}
                    totalProjects={projects.length}
                />

                {/* Main Content */}
                <div className="lg:ml-72 min-h-screen">
                    <AdminTopBar
                        setIsSidebarOpen={setIsSidebarOpen}
                        activeTab={activeTab}
                        signOut={signOut}
                    />

                    {/* Content Area */}
                    <div className="p-6">
                        {/* Dashboard Tab */}
                        {activeTab === "dashboard" && (
                            <DashboardOverview
                                projects={projects}
                                allFiles={allFiles}
                                totalUsers={totalUsers}
                                todayProjects={todayProjects}
                                todayFiles={todayFiles}
                                setActiveTab={setActiveTab}
                            />
                        )}

                        {/* Documents Tab */}
                        {activeTab === "documents" && (
                            <div>
                                <SearchAndFilter
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    selectedStatus={selectedStatus}
                                    setSelectedStatus={setSelectedStatus}
                                />

                                <ProjectsList
                                    projects={paginatedProjects}
                                    isLoading={isLoading}
                                    expandedProjects={expandedProjects}
                                    viewedProjects={viewedProjects}
                                    totalItems={totalItems}
                                    startIndex={startIndex}
                                    endIndex={endIndex}
                                    onToggleProjectExpansion={
                                        toggleProjectExpansion
                                    }
                                    onPreviewPdf={openPreviewModal}
                                    onEditProjectStatus={openStatusModal}
                                />

                                {/* Pagination */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === "users" && (
                            <UsersTab
                                totalUsers={totalUsers}
                                latestUser={latestUser}
                                allFiles={allFiles}
                                router={router}
                            />
                        )}
                    </div>
                </div>

                {/* All Modals */}
                <SuccessModal
                    isSuccessModalOpen={isSuccessModalOpen}
                    setIsSuccessModalOpen={setIsSuccessModalOpen}
                    successMessage={successMessage}
                />

                <PreviewModal
                    isPreviewModalOpen={isPreviewModalOpen}
                    previewUrl={previewUrl}
                    previewFileName={previewFileName}
                    closePreviewModal={closePreviewModal}
                />

                <ProjectStatusModal
                    isStatusModalOpen={isStatusModalOpen}
                    selectedProjectForStatus={selectedProjectForStatus}
                    newStatus={newStatus}
                    setNewStatus={setNewStatus}
                    statusNote={statusNote}
                    setStatusNote={setStatusNote}
                    isUpdatingStatus={isUpdatingStatus}
                    closeStatusModal={closeStatusModal}
                    handleUpdateProjectStatus={handleUpdateProjectStatus}
                    getStatusColor={getStatusColor}
                />
            </div>
        </>
    );
}
