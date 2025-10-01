import React from 'react';
import { Button } from "@/components/ui/button";
import FileItem from "./FileItem";

type UserFile = {
  id: string;
  originalFileName: string;
  storagePath: string;
  created_at: string;
  updated_at: string;
  fileExtension: string;
  userName: string;
  attachmentFiles?: any[];
};

type Project = {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  files: UserFile[];
  _count: {
    files: number;
  };
};

interface ProjectsListProps {
  projects: Project[];
  totalProjects: number;
  expandedProjects: Set<string>;
  toggleProjectExpansion: (projectId: string) => void;
  handleEditProject: (project: Project) => void;
  handleDeleteProject: (projectId: string) => void;
  openPreviewModal: (url: string, title: string) => void;
  handleDeleteFile: (fileId: string) => void;
  setShowCreateProjectModal: (show: boolean) => void;
  router: any;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

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

export const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  totalProjects,
  expandedProjects,
  toggleProjectExpansion,
  handleEditProject,
  handleDeleteProject,
  openPreviewModal,
  handleDeleteFile,
  setShowCreateProjectModal,
  router,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          โครงการของฉัน ({totalProjects} โครงการ)
        </h2>
        <Button
          onClick={() => setShowCreateProjectModal(true)}
          className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          สร้างโครงการใหม่
        </Button>
      </div>
      <div className="space-y-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
            >
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-4 rounded-lg transition-colors duration-200"
                onClick={() => toggleProjectExpansion(project.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {project.description || "ไม่มีคำอธิบาย"}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">
                        {project.files.length} เอกสาร
                      </span>
                      <span className="text-sm text-gray-500">
                        สร้างเมื่อ{" "}
                        {new Date(
                          project.created_at
                        ).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                    <div className="flex items-center mt-3">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 shadow-md ${getStatusColor(
                          project.status || "กำลังดำเนินการ"
                        )}`}
                      >
                        {/* Status Icon */}
                        {(project.status || "กำลังดำเนินการ") ===
                          "อนุมัติ" && (
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                        {(project.status || "กำลังดำเนินการ") ===
                          "ไม่อนุมัติ" && (
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        {(project.status || "กำลังดำเนินการ") ===
                          "แก้ไข" && (
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        )}
                        {(project.status || "กำลังดำเนินการ") ===
                          "กำลังดำเนินการ" && (
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        {(project.status || "กำลังดำเนินการ") ===
                          "ปิดโครงการ" && (
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        สถานะ: {project.status || "กำลังดำเนินการ"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      localStorage.setItem(
                        "selectedProjectId",
                        project.id
                      );
                      router.push("/createdocs");
                    }}
                    size="sm"
                    className="cursor-pointer transform hover:scale-105 transition-transform duration-300 p-4"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    สร้าง/เพิ่มเอกสาร
                  </Button>

                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-blue-500 hover:text-blue-700 transition-colors duration-200"
                      title="แก้ไขโครงการ"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-red-500 hover:text-red-700 transition-colors duration-200"
                      title="ลบโครงการ"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                      expandedProjects.has(project.id)
                        ? "rotate-180"
                        : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {expandedProjects.has(project.id) && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                  {project.files.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        📁 ไฟล์ในโครงการ ({project.files.length} ไฟล์)
                      </div>
                      {project.files.map((file) => (
                        <FileItem
                          key={file.id}
                          file={file}
                          onPreviewFile={openPreviewModal}
                          onDeleteFile={handleDeleteFile}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        ยังไม่มีเอกสาร
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        เริ่มสร้างเอกสารแรกในโครงการนี้
                      </p>
                      <div className="mt-4">
                        <Button
                          onClick={() => {
                            localStorage.setItem(
                              "selectedProjectId",
                              project.id
                            );
                            router.push("/createdocs");
                          }}
                          size="sm"
                          className="cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          เพิ่มเอกสารแรก
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              ยังไม่มีโครงการ
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              เริ่มสร้างโครงการแรกของคุณ
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setShowCreateProjectModal(true)}
                className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                สร้างโครงการใหม่
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
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
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                currentPage === totalPages
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
  );
};