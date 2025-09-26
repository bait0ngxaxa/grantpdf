"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { useTitle } from "@/hook/useTitle";

// Import hooks
import { useAdminData } from "./hooks/useAdminData";
import { useFileActions } from "./hooks/useFileActions";
import { useProjectStatusActions } from "./hooks/useProjectStatusActions";
import { usePreviewModal, useSuccessModal } from "./hooks/useModalStates";
import { useUIStates } from "./hooks/useUIStates";

// Import components
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminTopBar } from "./components/AdminTopBar";
import { DashboardOverview } from "./components/DashboardOverview";
import { UsersTab } from "./components/UsersTab";

// Import existing components
import SearchAndFilter from "./components/SearchAndFilter";
import ProjectsList from "./components/ProjectsList";

// Import modals
import { DeleteFileModal } from "./components/modals/DeleteFileModal";
import { SuccessModal } from "./components/modals/SuccessModal";
import { PreviewModal } from "./components/modals/PreviewModal";
import { ProjectStatusModal } from "./components/modals/ProjectStatusModal";

// Types
interface PdfFile {
  id: string;
  fileName: string;
  createdAt: string;
  lastModified: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  pdfUrl?: string;
  originalFileName: string;
  storagePath: string;
  created_at: string;
  updated_at: string;
  fileExtension: string;
  downloadStatus: string;
  downloadedAt?: string;
  attachmentFiles?: AttachmentFile[];
}

interface AttachmentFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  userId: string;
  userName: string;
  userEmail: string;
  files: PdfFile[];
  _count: {
    files: number;
  };
}

const itemsPerPage = 5;

const getStatusColor = (status: string) => {
  switch (status) {
    case "กำลังดำเนินการ":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "อนุมัติ":
      return "bg-green-100 text-green-800 border-green-200";
    case "ไม่อนุมัติ":
      return "bg-red-100 text-red-800 border-red-200";
    case "แก้ไข":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "ปิดโครงการ":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Dynamic title based on active tab
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

  // Custom hooks
  const {
    projects,
    setProjects,
    orphanFiles,
    setOrphanFiles,
    isLoading,
    error,
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
    expandedRows,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    selectedFileType,
    setSelectedFileType,
    selectedStatus,
    setSelectedStatus,
    toggleProjectExpansion,
    toggleRowExpansion,
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
    isDeleteModalOpen,
    selectedFileIdForDeletion,
    selectedFileNameForDeletion,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteFile,
  } = useFileActions(setProjects, setOrphanFiles, setSuccessMessage, setIsSuccessModalOpen);

  const {
    isStatusModalOpen,
    selectedProjectForStatus,
    newStatus,
    setNewStatus,
    isUpdatingStatus,
    openStatusModal,
    closeStatusModal,
    handleUpdateProjectStatus,
  } = useProjectStatusActions(setProjects, setSuccessMessage, setIsSuccessModalOpen);

  // Set dynamic title
  useTitle(getTitleByTab(activeTab));

  // Effects
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/access-denied");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session && session.user?.role === "admin") {
      fetchProjects(session);
    }
  }, [session]);

  // Filter and sort data
  const filteredAndSortedProjects = useMemo(() => {
    let filteredProjects = projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.files.some((file) =>
          file.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Filter by file type
      let matchesFileType = true;
      if (selectedFileType !== "ไฟล์ทั้งหมด") {
        matchesFileType = project.files.some(
          (file) =>
            file.fileExtension.toLowerCase() === selectedFileType.toLowerCase()
        );
      }

      // Filter by project status
      let matchesStatus = true;
      if (selectedStatus !== "สถานะทั้งหมด") {
        matchesStatus = project.status === selectedStatus;
      }

      return matchesSearch && matchesFileType && matchesStatus;
    });

    // Sort projects
    filteredProjects.sort((a, b) => {
      switch (sortBy) {
        case "createdAtAsc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "createdAtDesc":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
            (b.status === "อนุมัติ" ? 1 : 0) - (a.status === "อนุมัติ" ? 1 : 0)
          );
        case "statusPending":
          return (
            (b.status === "กำลังดำเนินการ" ? 1 : 0) -
            (a.status === "กำลังดำเนินการ" ? 1 : 0)
          );
        case "statusRejected":
          return (
            (b.status === "ไม่อนุมัติ" ? 1 : 0) -
            (a.status === "ไม่อนุมัติ" ? 1 : 0)
          );
        case "statusEdit":
          return (
            (b.status === "แก้ไข" ? 1 : 0) - (a.status === "แก้ไข" ? 1 : 0)
          );
        case "statusClosed":
          return (
            (b.status === "ปิดโครงการ" ? 1 : 0) - (a.status === "ปิดโครงการ" ? 1 : 0)
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

  // Calculate all files for stats
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
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          session={session}
          router={router}
          totalUsers={totalUsers}
          todayProjects={todayProjects}
          todayFiles={todayFiles}
          totalProjects={projects.length}
        />

        {/* Main Content */}
        <div className="lg:ml-64 min-h-screen">
          <AdminTopBar
            isSidebarOpen={isSidebarOpen}
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
                latestUser={latestUser}
                todayProjects={todayProjects}
                todayFiles={todayFiles}
                setActiveTab={setActiveTab}
                router={router}
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
                  selectedFileType={selectedFileType}
                  setSelectedFileType={setSelectedFileType}
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
                  onToggleProjectExpansion={toggleProjectExpansion}
                  onPreviewPdf={openPreviewModal}
                  onDeleteFile={openDeleteModal}
                  onEditProjectStatus={openStatusModal}
                />

                {/* Pagination */}
                {totalItems > itemsPerPage && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                        { length: Math.ceil(totalItems / itemsPerPage) },
                        (_, i) => i + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
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
                        onClick={() => setCurrentPage(Math.min(Math.ceil(totalItems / itemsPerPage), currentPage + 1))}
                        disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          currentPage === Math.ceil(totalItems / itemsPerPage)
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
        <DeleteFileModal
          isDeleteModalOpen={isDeleteModalOpen}
          selectedFileIdForDeletion={selectedFileIdForDeletion}
          selectedFileNameForDeletion={selectedFileNameForDeletion}
          isDeleting={isDeleting}
          closeDeleteModal={closeDeleteModal}
          handleDeleteFile={handleDeleteFile}
        />

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
          isUpdatingStatus={isUpdatingStatus}
          closeStatusModal={closeStatusModal}
          handleUpdateProjectStatus={handleUpdateProjectStatus}
          getStatusColor={getStatusColor}
        />
      </div>
    </>
  );
}