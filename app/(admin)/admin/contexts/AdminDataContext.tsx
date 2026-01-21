"use client";

import React, {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import { useAdminData } from "../hooks";
import type { Session } from "next-auth";
import type {
    AdminProject,
    AdminDocumentFile,
    LatestUser,
} from "@/type/models";

interface AdminDataContextType {
    projects: AdminProject[];
    orphanFiles: AdminDocumentFile[];
    isLoading: boolean;
    error: string | null;
    totalUsers: number;
    latestUser: LatestUser | null;
    todayProjects: number;
    todayFiles: number;
    allFiles: AdminDocumentFile[];
    fetchProjects: (session: Session | null) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(
    undefined,
);

export function AdminDataProvider({ children }: { children: ReactNode }) {
    const adminData = useAdminData();

    // Calculate derived state
    const allFiles = useMemo(
        () => [
            ...adminData.orphanFiles,
            ...adminData.projects.flatMap((p) => p.files),
        ],
        [adminData.orphanFiles, adminData.projects],
    );

    const value = useMemo(
        () => ({
            ...adminData,
            allFiles,
        }),
        [adminData, allFiles],
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
