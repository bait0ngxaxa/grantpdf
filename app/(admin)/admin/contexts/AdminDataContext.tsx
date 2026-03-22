"use client";

import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    type ReactNode,
} from "react";
import { useAdminData } from "../hooks";
import { useAdminUI } from "./AdminUIContext";
import type {
    AdminProject,
    LatestUser,
} from "@/type/models";

interface AdminDataContextType {
    projects: AdminProject[];
    isLoading: boolean;
    error: string | null;
    totalProjects: number;
    totalPages: number;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalUsers: number;
    latestUser: LatestUser | null;
    todayProjects: number;
    todayFiles: number;
    totalFiles: number;
    statusCounts: { pending: number; approved: number; rejected: number; editing: number; closed: number };
    fetchProjects: () => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(
    undefined,
);

export function AdminDataProvider({ children }: { children: ReactNode }) {
    const ui = useAdminUI();
    const [currentPage, setCurrentPage] = useState(1);

    // Build a stable key from filter values to detect changes
    const filterKey = `${ui.searchTerm}|${ui.selectedStatus}|${ui.selectedFileType}|${ui.sortBy}`;
    const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

    // React-recommended pattern: adjust state during render when inputs change
    if (filterKey !== prevFilterKey) {
        setPrevFilterKey(filterKey);
        setCurrentPage(1);
    }

    const adminData = useAdminData({
        page: currentPage,
        search: ui.searchTerm || undefined,
        status: ui.selectedStatus || undefined,
        fileType: ui.selectedFileType || undefined,
        sortBy: ui.sortBy || undefined,
    });

    // Remove the allFiles array calculation
    // const allFiles = useMemo(
    //     () => [
    //         ...adminData.orphanFiles,
    //         ...adminData.projects.flatMap((p) => p.files),
    //     ],
    //     [adminData.orphanFiles, adminData.projects],
    // );

    // Explicitly memoize projects and totalFiles from adminData
    const projects = useMemo(() => adminData.projects, [adminData.projects]);
    const totalFiles = useMemo(
        () => adminData.totalFiles,
        [adminData.totalFiles],
    );

    const value = useMemo(
        () => ({
            ...adminData,
            projects, // Use the memoized projects
            totalFiles, // Use the memoized totalFiles instead of allFiles
            currentPage,
            setCurrentPage,
        }),
        [adminData, projects, totalFiles, currentPage], // Update dependencies
    );

    return (
        <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>
    );
}

export function useAdminDataData() {
    const context = useContext(AdminDataContext);
    if (context === undefined) {
        throw new Error(
            "useAdminDataData must be used within an AdminDataProvider",
        );
    }
    return context;
}
