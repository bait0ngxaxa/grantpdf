import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  files: any[];
  _count: {
    files: number;
  };
};

interface DashboardOverviewProps {
  projects: Project[];
  totalDocuments: number;
  setActiveTab: (tab: string) => void;
}

const truncateFileName = (fileName: string, maxLength: number = 30): string => {
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.split(".").pop() || "";
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
  const truncatedName =
    nameWithoutExt.substring(0, maxLength - extension.length - 4) + "...";
  return `${truncatedName}.${extension}`;
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  projects,
  totalDocuments,
  setActiveTab,
}) => {
  // Calculate project status counts
  const projectStatusCounts = useMemo(() => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      editing: 0,
      closed: 0,
    };

    projects.forEach((project) => {
      const status = project.status || "กำลังดำเนินการ";
      switch (status) {
        case "กำลังดำเนินการ":
          counts.pending++;
          break;
        case "อนุมัติ":
          counts.approved++;
          break;
        case "ไม่อนุมัติ":
          counts.rejected++;
          break;
        case "แก้ไข":
          counts.editing++;
          break;
        case "ปิดโครงการ":
          counts.closed++;
          break;
      }
    });

    return counts;
  }, [projects]);

  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-white dark:bg-gray-800 shadow-xl p-6 rounded-xl transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-start space-x-4">
            <div className="text-primary bg-secondary bg-opacity-10 p-3 rounded-full flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 stroke-current"
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
            <div className="flex-1 min-w-0">
              <div className="text-m font-semibold text-gray-500 dark:text-gray-400 mb-1">
                โครงการทั้งหมด
              </div>
              <div className="text-2xl font-bold mb-1">
                {projects.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                โครงการที่คุณสร้าง
              </div>

              {/* Status Details */}
              {projects.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        รอดำเนินการ
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-yellow-600">
                      {projectStatusCounts.pending}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        อนุมัติแล้ว
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {projectStatusCounts.approved}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        ไม่อนุมัติ
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {projectStatusCounts.rejected}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        ต้องแก้ไข
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-orange-600">
                      {projectStatusCounts.editing}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 shadow-xl p-6 rounded-xl transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-start space-x-4">
            <div className="text-secondary bg-primary bg-opacity-10 p-3 rounded-full flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-1">
                เอกสารทั้งหมด
              </div>
              <div className="text-2xl font-bold mb-1">
                {totalDocuments}
              </div>
              <div className="text-l text-gray-500 dark:text-gray-400">
                เอกสารที่คุณสร้าง
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 shadow-xl p-6 rounded-xl transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-start space-x-4">
            <div className="text-accent bg-info bg-opacity-10 p-3 rounded-full flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-1">
                โครงการล่าสุด
              </div>
              <div className="text-2xl font-bold mb-1 truncate">
                {projects.length > 0
                  ? truncateFileName(projects[0].name, 20)
                  : "ยังไม่มีโครงการ"}
              </div>
              <div className="text-l text-gray-500 dark:text-gray-400">
                {projects.length > 0
                  ? new Date(
                      projects[0].created_at
                    ).toLocaleDateString("th-TH")
                  : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-primary"
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
            โครงการของฉัน
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ดูและจัดการโครงการทั้งหมดของคุณ
          </p>
          <Button
            onClick={() => setActiveTab("projects")}
            className="w-full cursor-pointer transform hover:scale-105 transition-transform duration-300"
          >
            ดูโครงการทั้งหมด
          </Button>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-primary"
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
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            สร้างโครงการใหม่และเริ่มต้นจัดการเอกสาร
          </p>
          <Button
            onClick={() => setActiveTab("create")}
            className="w-full cursor-pointer transform hover:scale-105 transition-transform duration-300"
            variant="outline"
          >
            สร้างโครงการ
          </Button>
        </div>
      </div>
    </div>
  );
};