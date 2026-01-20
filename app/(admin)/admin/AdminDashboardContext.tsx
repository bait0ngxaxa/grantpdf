"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    type ReactNode,
    useState,
    useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { useAdminData, useUIStates } from "./hooks";
import type {
    AdminProject,
    AdminDocumentFile,
    LatestUser,
} from "@/type/models";
import type { Session } from "next-auth";

interface AdminDashboardContextType {
    // UI State
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    expandedProjects: Set<string>;
    viewedProjects: Set<string>;
    expandedRows: Set<string>;
    toggleProjectExpansion: (projectId: string) => void;
    toggleRowExpansion: (fileId: string) => void;

    // Search & Filter
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    selectedFileType: string;
    setSelectedFileType: (type: string) => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;

    // Modal States
    isSuccessModalOpen: boolean;
    setIsSuccessModalOpen: (open: boolean) => void;
    successMessage: string;
    setSuccessMessage: (message: string) => void;

    isPreviewModalOpen: boolean;
    setIsPreviewModalOpen: (open: boolean) => void;
    previewUrl: string;
    setPreviewUrl: (url: string) => void;
    previewFileName: string;
    setPreviewFileName: (name: string) => void;

    isStatusModalOpen: boolean;
    setIsStatusModalOpen: (open: boolean) => void;
    selectedProjectForStatus: AdminProject | null;
    setSelectedProjectForStatus: React.Dispatch<
        React.SetStateAction<AdminProject | null>
    >;
    newStatus: string;
    setNewStatus: (status: string) => void;
    statusNote: string;
    setStatusNote: (note: string) => void;

    // Data State
    projects: AdminProject[];
    setProjects: React.Dispatch<React.SetStateAction<AdminProject[]>>;
    orphanFiles: AdminDocumentFile[];
    setOrphanFiles: React.Dispatch<React.SetStateAction<AdminDocumentFile[]>>;
    isLoading: boolean;
    error: string | null;
    totalUsers: number;
    latestUser: LatestUser | null;
    todayProjects: number;
    todayFiles: number;
    allFiles: AdminDocumentFile[];
    fetchProjects: (session: Session | null) => Promise<void>;
}

const AdminDashboardContext = createContext<
    AdminDashboardContextType | undefined
>(undefined);

export function AdminDashboardProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();

    // UI States
    const uiStates = useUIStates();

    // Data States
    const adminData = useAdminData();

    // Modal States
    // 1. Success Modal
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // 2. Preview Modal
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewFileName, setPreviewFileName] = useState("");

    // 3. Status Modal
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedProjectForStatus, setSelectedProjectForStatus] =
        useState<AdminProject | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [statusNote, setStatusNote] = useState("");

    // Initial Fetch
    const hasFetchedRef = React.useRef(false);

    useEffect(() => {
        if (
            session &&
            session.user?.role === "admin" &&
            !hasFetchedRef.current
        ) {
            hasFetchedRef.current = true;
            adminData.fetchProjects(session);
        }
    }, [session, adminData]);

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
            ...uiStates,
            ...adminData,

            // Modal States
            isSuccessModalOpen,
            setIsSuccessModalOpen,
            successMessage,
            setSuccessMessage,
            isPreviewModalOpen,
            setIsPreviewModalOpen,
            previewUrl,
            setPreviewUrl,
            previewFileName,
            setPreviewFileName,
            isStatusModalOpen,
            setIsStatusModalOpen,
            selectedProjectForStatus,
            setSelectedProjectForStatus,
            newStatus,
            setNewStatus,
            statusNote,
            setStatusNote,
            allFiles,
        }),
        [
            uiStates,
            adminData,
            isSuccessModalOpen,
            successMessage,
            isPreviewModalOpen,
            previewUrl,
            previewFileName,
            isStatusModalOpen,
            selectedProjectForStatus,
            newStatus,
            statusNote,
            allFiles,
        ],
    );

    return (
        <AdminDashboardContext.Provider value={value}>
            {children}
        </AdminDashboardContext.Provider>
    );
}

export function useAdminDashboardContext() {
    const context = useContext(AdminDashboardContext);
    if (context === undefined) {
        throw new Error(
            "useAdminDashboardContext must be used within an AdminDashboardProvider",
        );
    }
    return context;
}
