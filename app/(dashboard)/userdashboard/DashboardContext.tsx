"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
    useMemo,
} from "react";
import { useUserData } from "./hooks/useUserData";
import { useSession } from "next-auth/react";
import type { Project, UserFile } from "@/type";

interface DashboardContextType {
    // UI State
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;

    // Modal State
    showCreateProjectModal: boolean;
    setShowCreateProjectModal: (show: boolean) => void;
    showProfileModal: boolean;
    setShowProfileModal: (show: boolean) => void;

    // New Modal States
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    previewUrl: string;
    setPreviewUrl: (url: string) => void;
    previewTitle: string;
    setPreviewTitle: (title: string) => void;
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    showSuccessModal: boolean;
    setShowSuccessModal: (show: boolean) => void;
    showEditProjectModal: boolean;
    setShowEditProjectModal: (show: boolean) => void;

    // Action Payloads
    fileToDelete: string | null;
    setFileToDelete: React.Dispatch<React.SetStateAction<string | null>>;
    projectToDelete: string | null;
    setProjectToDelete: React.Dispatch<React.SetStateAction<string | null>>;
    projectToEdit: Project | null;
    setProjectToEdit: React.Dispatch<React.SetStateAction<Project | null>>;
    successMessage: string;
    setSuccessMessage: (msg: string) => void;
    editProjectName: string;
    setEditProjectName: (name: string) => void;
    editProjectDescription: string;
    setEditProjectDescription: (desc: string) => void;
    newProjectName: string;
    setNewProjectName: (name: string) => void;
    newProjectDescription: string;
    setNewProjectDescription: (desc: string) => void;

    // Data State
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    orphanFiles: UserFile[];
    setOrphanFiles: React.Dispatch<React.SetStateAction<UserFile[]>>;
    isLoading: boolean;
    error: string | null;
    fetchUserData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
    undefined,
);

export function DashboardProvider({ children }: { children: ReactNode }) {
    // UI State
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Modal Visibility & Payloads
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);

    // Action States
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [editProjectName, setEditProjectName] = useState("");
    const [editProjectDescription, setEditProjectDescription] = useState("");
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");

    // Data State
    const {
        projects,
        setProjects,
        orphanFiles,
        setOrphanFiles,
        isLoading,
        error,
        fetchUserData,
    } = useUserData();

    // Initial Fetch
    const { status } = useSession();

    useEffect(() => {
        if (status === "authenticated") {
            fetchUserData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const value = useMemo(
        () => ({
            activeTab,
            setActiveTab,
            isSidebarOpen,
            setIsSidebarOpen,
            showCreateProjectModal,
            setShowCreateProjectModal,
            showProfileModal,
            setShowProfileModal,

            // New Modal States
            isModalOpen,
            setIsModalOpen,
            previewUrl,
            setPreviewUrl,
            previewTitle,
            setPreviewTitle,
            showDeleteModal,
            setShowDeleteModal,
            showSuccessModal,
            setShowSuccessModal,
            showEditProjectModal,
            setShowEditProjectModal,

            // Action Payloads
            fileToDelete,
            setFileToDelete,
            projectToDelete,
            setProjectToDelete,
            projectToEdit,
            setProjectToEdit,
            successMessage,
            setSuccessMessage,
            editProjectName,
            setEditProjectName,
            editProjectDescription,
            setEditProjectDescription,
            newProjectName,
            setNewProjectName,
            newProjectDescription,
            setNewProjectDescription,

            projects,
            setProjects,
            orphanFiles,
            setOrphanFiles,
            isLoading,
            error,
            fetchUserData,
        }),
        [
            activeTab,
            isSidebarOpen,
            showCreateProjectModal,
            showProfileModal,
            isModalOpen,
            previewUrl,
            previewTitle,
            showDeleteModal,
            showSuccessModal,
            showEditProjectModal,
            fileToDelete,
            projectToDelete,
            projectToEdit,
            successMessage,
            editProjectName,
            editProjectDescription,
            newProjectName,
            newProjectDescription,
            projects,
            orphanFiles,
            isLoading,
            error,
            fetchUserData,
            setProjects,
            setOrphanFiles,
        ],
    );

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboardContext() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error(
            "useDashboardContext must be used within a DashboardProvider",
        );
    }
    return context;
}
