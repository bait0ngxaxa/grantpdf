import React from 'react';
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: any;
  router: any;
  totalUsers: number;
  todayProjects: number;
  todayFiles: number;
  totalProjects: number;
}

const menuItems = [
  {
    id: "dashboard",
    name: "ภาพรวมระบบ",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
    ),
  },
  {
    id: "documents",
    name: "จัดการโครงการและเอกสาร",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    id: "users",
    name: "จัดการผู้ใช้งาน",
    icon: <Users className="h-5 w-5" />,
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  session,
  router,
  totalUsers,
  todayProjects,
  todayFiles,
  totalProjects,
}) => {
  return (
    <>
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-focus rounded-lg flex items-center justify-center">
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
                    d="M9 12l2 2 4-4m5.586 1.414A11.955 11.955 0 0112 2.036 11.955 11.955 0 010 13.938V21.5h7.5v-7.562z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">
                  Admin Panel
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ระบบจัดการสำหรับผู้ดูแลระบบ
                </p>
              </div>
            </div>
            <button
              className="lg:hidden btn btn-ghost btn-sm"
              onClick={() => setIsSidebarOpen(false)}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 text-left ${
                    activeTab === item.id
                      ? "bg-primary text-white shadow-md"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </div>
                 
                </button>
              </li>
            ))}
          </ul>

          {/* Quick Stats Section */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              สถิติวันนี้
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  โครงการใหม่:
                </span>
                <span className="font-semibold text-green-600">
                  {todayProjects}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  ไฟล์ใหม่:
                </span>
                <span className="font-semibold text-orange-600">
                  {todayFiles}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  รวมโครงการ:
                </span>
                <span className="font-semibold text-blue-600">
                  {totalProjects}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {session.user?.name?.charAt(0) ||
                  session.user?.email?.charAt(0) ||
                  "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-m font-medium text-gray-900 dark:text-white truncate">
                {session.user?.name || "Admin"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {session.user?.role}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full text-sm cursor-pointer"
            onClick={() => router.push("/userdashboard")}
          >
            กลับ Dashboard ผู้ใช้
          </Button>
        </div>
      </div>
    </>
  );
};