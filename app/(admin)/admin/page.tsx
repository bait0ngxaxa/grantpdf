"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { useTitle } from "@/hooks/useTitle";

import { useAdminData } from "./hooks/useAdminData";
import { useProjectStatusActions } from "./hooks/useProjectStatusActions";
import { usePreviewModal, useSuccessModal } from "./hooks/useModalStates";
import { useUIStates } from "./hooks/useUIStates";

import { AdminSidebar } from "./components/AdminSidebar";
import { AdminTopBar } from "./components/AdminTopBar";
import { DashboardOverview } from "./components/DashboardOverview";
import { UsersTab } from "./components/UsersTab";

import SearchAndFilter from "./components/SearchAndFilter";
import ProjectsList from "./components/ProjectsList";

import { SuccessModal } from "./components/modals/SuccessModal";
import { PreviewModal } from "./components/modals/PreviewModal";
import { ProjectStatusModal } from "./components/modals/ProjectStatusModal";

// Import shared types and constants
import { PROJECT_STATUS } from "@/type/models";
import { PAGINATION, FILE_TYPES, STATUS_FILTER } from "@/lib/constants";
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
        currentPage,
        setCurrentPage,
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

    const filteredAndSortedProjects = useMemo(() => {
        const filteredProjects = projects.filter((project) => {
            const matchesSearch =
                project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.userName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                project.files.some((file) =>
                    file.originalFileName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                );

            let matchesFileType = true;
            if (selectedFileType !== FILE_TYPES.ALL) {
                matchesFileType = project.files.some(
                    (file) =>
                        file.fileExtension.toLowerCase() ===
                        selectedFileType.toLowerCase()
                );
            }

            let matchesStatus = true;
            if (selectedStatus !== STATUS_FILTER.ALL) {
                matchesStatus = project.status === selectedStatus;
            }

            return matchesSearch && matchesFileType && matchesStatus;
        });

        filteredProjects.sort((a, b) => {
            switch (sortBy) {
                case "createdAtAsc":
                    return (
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    );
                case "createdAtDesc":
                default:
                    return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );
                case "statusDoneFirst":
                    const aDoneCount = a.files.filter(
                        (f) => f.downloadStatus === "done"
                    ).length;
                    const bDoneCount = b.files.filter(
                        (f) => f.downloadStatus === "done"
                    ).length;
                    return bDoneCount - aDoneCount;
                case "statusPendingFirst":
                    const aPendingCount = a.files.filter(
                        (f) => f.downloadStatus !== "done"
                    ).length;
                    const bPendingCount = b.files.filter(
                        (f) => f.downloadStatus !== "done"
                    ).length;
                    return bPendingCount - aPendingCount;
                case "statusApproved":
                    return (
                        (b.status === PROJECT_STATUS.APPROVED ? 1 : 0) -
                        (a.status === PROJECT_STATUS.APPROVED ? 1 : 0)
                    );
                case "statusPending":
                    return (
                        (b.status === PROJECT_STATUS.IN_PROGRESS ? 1 : 0) -
                        (a.status === PROJECT_STATUS.IN_PROGRESS ? 1 : 0)
                    );
                case "statusRejected":
                    return (
                        (b.status === PROJECT_STATUS.REJECTED ? 1 : 0) -
                        (a.status === PROJECT_STATUS.REJECTED ? 1 : 0)
                    );
                case "statusEdit":
                    return (
                        (b.status === PROJECT_STATUS.EDIT ? 1 : 0) -
                        (a.status === PROJECT_STATUS.EDIT ? 1 : 0)
                    );
                case "statusClosed":
                    return (
                        (b.status === PROJECT_STATUS.CLOSED ? 1 : 0) -
                        (a.status === PROJECT_STATUS.CLOSED ? 1 : 0)
                    );
            }
        });

        return { projects: filteredProjects, orphanFiles };
    }, [
        projects,
        orphanFiles,
        searchTerm,
        selectedFileType,
        selectedStatus,
        sortBy,
    ]);

    const allFiles = useMemo(() => {
        return [...orphanFiles, ...projects.flatMap((p) => p.files)];
    }, [orphanFiles, projects]);

    // Pagination
    const totalItems = filteredAndSortedProjects.projects.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProjects = filteredAndSortedProjects.projects.slice(
        startIndex,
        endIndex
    );

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
                                {totalItems > itemsPerPage && (
                                    <div className="flex justify-center mt-8">
                                        <div className="flex items-center space-x-2">
                                            {/* Previous Button */}
                                            <button
                                                onClick={() =>
                                                    setCurrentPage(
                                                        Math.max(
                                                            1,
                                                            currentPage - 1
                                                        )
                                                    )
                                                }
                                                disabled={currentPage === 1}
                                                className={`px-3 py-2 rounded-lg border transition-colors ${
                                                    currentPage === 1
                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
                                                }`}
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
                                                        d="M15 19l-7-7 7-7"
                                                    />
                                                </svg>
                                            </button>

                                            {/* Page Numbers */}
                                            {Array.from(
                                                {
                                                    length: Math.ceil(
                                                        totalItems /
                                                            itemsPerPage
                                                    ),
                                                },
                                                (_, i) => i + 1
                                            ).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() =>
                                                        setCurrentPage(page)
                                                    }
                                                    className={`px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                                                        currentPage === page
                                                            ? "bg-primary text-white border-primary"
                                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            {/* Next Button */}
                                            <button
                                                onClick={() =>
                                                    setCurrentPage(
                                                        Math.min(
                                                            Math.ceil(
                                                                totalItems /
                                                                    itemsPerPage
                                                            ),
                                                            currentPage + 1
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    currentPage ===
                                                    Math.ceil(
                                                        totalItems /
                                                            itemsPerPage
                                                    )
                                                }
                                                className={`px-3 py-2 rounded-lg border transition-colors ${
                                                    currentPage ===
                                                    Math.ceil(
                                                        totalItems /
                                                            itemsPerPage
                                                    )
                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
                                                }`}
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
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
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
