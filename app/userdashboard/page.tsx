"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { useTitle } from "@/hook/useTitle";

// API Response type for better type safety
type UserFile = {
    id: string;
    originalFileName: string;
    storagePath: string;
    created_at: string;
    updated_at: string;
    fileExtension: string;
    userName: string;
    attachmentFiles?: AttachmentFile[]; // เพิ่มข้อมูลไฟล์แนบ
};

type AttachmentFile = {
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
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

type ProjectsResponse = {
    projects: Project[];
    orphanFiles: UserFile[];
};

// เพิ่มฟังก์ชันตัดชื่อไฟล์ที่ด้านบนของไฟล์ (หลังจาก import statements)
const truncateFileName = (fileName: string, maxLength: number = 30): string => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop() || '';
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
    
    return `${truncatedName}.${extension}`;
};

// ฟังก์ชันให้สีตามสถานะโครงการ
const getStatusColor = (status: string) => {
    switch (status) {
        case 'กำลังดำเนินการ':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'อนุมัติ':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'ไม่อนุมัติ':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAtDesc");
    const [selectedDepartment, setSelectedDepartment] = useState("ทั้งหมด");
    const [selectedFileType, setSelectedFileType] = useState("ทั้งหมด");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // New state for profile modal
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    // Sidebar state
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // New state for fetching data from the API
    const [projects, setProjects] = useState<Project[]>([]);
    const [orphanFiles, setOrphanFiles] = useState<UserFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    
    // Project management states
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    
    // Modal states for delete confirmation and success
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    // State for project management
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [editProjectName, setEditProjectName] = useState("");
    const [editProjectDescription, setEditProjectDescription] = useState("");
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [isUpdatingProject, setIsUpdatingProject] = useState(false);
    const [isDeletingProject, setIsDeletingProject] = useState(false);

    // State for expandable rows (attachment files)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useTitle("UserDashboard | ระบบจัดการเอกสาร");

    // Fetch user projects and documents from the API
    const fetchUserData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/projects");
            if (!res.ok) {
                throw new Error("Failed to fetch projects");
            }
            const data: ProjectsResponse = await res.json();
            setProjects(data.projects);
            setOrphanFiles(data.orphanFiles);
        } catch (err) {
            console.error("Error fetching projects:", err);
            setError("ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsLoading(false);
        }
    };

    // Create new project
    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        
        setIsCreatingProject(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newProjectName.trim(),
                    description: newProjectDescription.trim() || null,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create project");
            }

            const newProject: Project = await res.json();
            setProjects(prev => [newProject, ...prev]);
            setNewProjectName("");
            setNewProjectDescription("");
            setShowCreateProjectModal(false);
            
            // Switch to projects tab to show the newly created project
            setActiveTab("projects");
            
            // Show success message
            setSuccessMessage("สร้างโครงการสำเร็จ");
            setShowSuccessModal(true);
            
        } catch (err) {
            console.error("Error creating project:", err);
            setSuccessMessage("เกิดข้อผิดพลาดในการสร้างโครงการ กรุณาลองใหม่อีกครั้ง");
            setShowSuccessModal(true);
        } finally {
            setIsCreatingProject(false);
        }
    };

    // Toggle project expansion
    const toggleProjectExpansion = (projectId: string) => {
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    // Handle file deletion - Show confirmation modal
    const handleDeleteFile = (fileId: string) => {
        setFileToDelete(fileId);
        setShowDeleteModal(true);
    };

    // Confirm delete file
    const confirmDeleteFile = async () => {
        if (!fileToDelete) return;

        setIsDeleting(fileToDelete);
        setShowDeleteModal(false);
        
        try {
            const res = await fetch(`/api/admin/dashboard/file/${fileToDelete}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete file");
            }

            // Remove file from local state
            setProjects(prev => prev.map(project => ({
                ...project,
                files: project.files.filter(file => file.id !== fileToDelete)
            })));
            setOrphanFiles(prev => prev.filter(file => file.id !== fileToDelete));
            
            // Show success modal
            setSuccessMessage("ลบไฟล์สำเร็จ");
            setShowSuccessModal(true);
            
        } catch (err) {
            console.error("Error deleting file:", err);
            setSuccessMessage("เกิดข้อผิดพลาดในการลบไฟล์ กรุณาลองใหม่อีกครั้ง");
            setShowSuccessModal(true);
        } finally {
            setIsDeleting(null);
            setFileToDelete(null);
        }
    };

    // Handle project deletion - Show confirmation modal
    const handleDeleteProject = (projectId: string) => {
        setProjectToDelete(projectId);
        setShowDeleteModal(true);
    };

    // Confirm delete project
    const confirmDeleteProject = async () => {
        if (!projectToDelete) return;

        setIsDeletingProject(true);
        setShowDeleteModal(false);
        
        try {
            const res = await fetch(`/api/projects/${projectToDelete}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete project");
            }

            // Remove project from local state
            setProjects(prev => prev.filter(project => project.id !== projectToDelete));
            
            // Show success modal
            setSuccessMessage("ลบโครงการสำเร็จ");
            setShowSuccessModal(true);
            
        } catch (err) {
            console.error("Error deleting project:", err);
            setSuccessMessage("เกิดข้อผิดพลาดในการลบโครงการ กรุณาลองใหม่อีกครั้ง");
            setShowSuccessModal(true);
        } finally {
            setIsDeletingProject(false);
            setProjectToDelete(null);
        }
    };

    // Handle project editing - Show edit modal
    const handleEditProject = (project: Project) => {
        setProjectToEdit(project);
        setEditProjectName(project.name);
        setEditProjectDescription(project.description || "");
        setShowEditProjectModal(true);
    };

    // Confirm update project
    const confirmUpdateProject = async () => {
        if (!projectToEdit || !editProjectName.trim()) return;

        setIsUpdatingProject(true);
        
        try {
            const res = await fetch(`/api/projects/${projectToEdit.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: editProjectName.trim(),
                    description: editProjectDescription.trim() || null,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update project");
            }

            const updatedProject: Project = await res.json();
            
            // Update project in local state
            setProjects(prev => prev.map(project => 
                project.id === updatedProject.id ? updatedProject : project
            ));
            
            // Close modal and reset state
            setShowEditProjectModal(false);
            setProjectToEdit(null);
            setEditProjectName("");
            setEditProjectDescription("");
            
            // Show success modal
            setSuccessMessage("อัปเดตโครงการสำเร็จ");
            setShowSuccessModal(true);
            
        } catch (err) {
            console.error("Error updating project:", err);
            setSuccessMessage("เกิดข้อผิดพลาดในการอัปเดตโครงการ กรุณาลองใหม่อีกครั้ง");
            setShowSuccessModal(true);
        } finally {
            setIsUpdatingProject(false);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setFileToDelete(null);
        setProjectToDelete(null);
    };

    // Toggle expand/collapse for attachment files
    const toggleRowExpansion = (fileId: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(fileId)) {
                newSet.delete(fileId);
            } else {
                newSet.add(fileId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin");
        } else if (status === "authenticated") {
            fetchUserData();
        }
    }, [status, router]);

    const openPreviewModal = (url: string, title: string) => {
        setPreviewUrl(url);
        setPreviewTitle(title);
        setIsModalOpen(true);
    };

    // Calculate total documents across all projects
    const totalDocuments = projects.reduce((total, project) => total + project.files.length, 0) + orphanFiles.length;

    // Calculate project status counts
    const projectStatusCounts = useMemo(() => {
        const counts = {
            pending: 0,
            approved: 0,
            rejected: 0
        };
        
        projects.forEach(project => {
            const status = project.status || 'กำลังดำเนินการ';
            switch (status) {
                case 'กำลังดำเนินการ':
                    counts.pending++;
                    break;
                case 'อนุมัติ':
                    counts.approved++;
                    break;
                case 'ไม่อนุมัติ':
                    counts.rejected++;
                    break;
            }
        });
        
        return counts;
    }, [projects]);

    // Filter and sort files with pagination - now works with projects and orphan files
    const filteredAndSortedFiles = useMemo(() => {
        // Combine all files from projects and orphan files
        const allFiles = [...orphanFiles, ...projects.flatMap(project => project.files)];
        
        let filtered = allFiles.filter((file) =>
            file.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Filter by file type
        if (selectedFileType !== "ทั้งหมด") {
            filtered = filtered.filter((file) =>
                file.fileExtension.toLowerCase() === selectedFileType.toLowerCase()
            );
        }

        // Sort the files
        const sorted = [...filtered].sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            if (sortBy === "createdAtAsc") {
                return dateA - dateB;
            }
            return dateB - dateA;
        });

        return sorted;
    }, [orphanFiles, projects, searchTerm, sortBy, selectedFileType]);

    // Pagination calculations
    const totalItems = filteredAndSortedFiles.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageFiles = filteredAndSortedFiles.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedFileType, sortBy]);

    // Pagination handlers
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToFirstPage = () => goToPage(1);
    const goToLastPage = () => goToPage(totalPages);
    const goToPreviousPage = () => goToPage(currentPage - 1);
    const goToNextPage = () => goToPage(currentPage + 1);

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages is less than or equal to maxVisiblePages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            // Calculate start and end of visible pages
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);
            
            // Adjust if we're near the beginning
            if (currentPage <= 3) {
                end = Math.min(totalPages - 1, 4);
            }
            
            // Adjust if we're near the end
            if (currentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - 3);
            }
            
            // Add ellipsis after first page if needed
            if (start > 2) {
                pages.push('...');
            }
            
            // Add visible pages
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            // Add ellipsis before last page if needed
            if (end < totalPages - 1) {
                pages.push('...');
            }
            
            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-red-500 text-center p-4">
                <p>{error}</p>
            </div>
        );
    }

    const menuItems = [
        {
            id: "dashboard",
            name: "ภาพรวม",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            )
        },
        {
            id: "projects",
            name: "โครงการของฉัน",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            id: "create-project",
            name: "สร้างโครงการ",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        {
            id: "documents",
            name: "เอกสารของฉัน",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            id: "create",
            name: "สร้างเอกสาร/อัพโหลด",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        
    ];

    return (
        <div>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                {/* Mobile sidebar overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* Sidebar */}
                <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-primary">Dashboard</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ระบบจัดการเอกสาร</p>
                                </div>
                            </div>
                            <button 
                                className="lg:hidden btn btn-ghost btn-sm"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-4">
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => {
                                            if (item.id === "create-project") {
                                                setShowCreateProjectModal(true);
                                            } else {
                                                setActiveTab(item.id);
                                            }
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left ${
                                            activeTab === item.id
                                                ? 'bg-primary text-white shadow-md'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {item.icon}
                                        <span className="font-medium">{item.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* User Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-m font-medium text-gray-900 dark:text-white truncate">
                                    {session?.user?.name || 'ผู้ใช้'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                onClick={() => setShowProfileModal(true)}
                                className="flex-1 text-xs transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                            >
                                ข้อมูลส่วนตัว
                            </Button>
                            <button 
                                onClick={() => signOut()}
                                className="flex-1 text-xs btn btn-ghost btn-sm text-red-600 dark:text-red-400 hover:text-red-500 transform hover:scale-105 transition-transform duration-300"
                                title="ออกจากระบบ"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline ml-1">ออกจากระบบ</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:ml-64 min-h-screen">
                    {/* Top Bar */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button 
                                    className="lg:hidden btn btn-ghost btn-sm"
                                    onClick={() => setIsSidebarOpen(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {menuItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
                                </h1>
                            </div>
                            <div className=" flex gap-3 sm:flex md:gap-1 items-center space-x-4">
                                <span className="text-m text-gray-600 dark:text-gray-400">
                                    {session?.user?.name} ({session?.user?.role || 'member'})
                                </span>
                                {session?.user?.role === "admin" && (
                                    <Button
                                        // variant="outline"
                                        className="font-semibold cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                        onClick={() => router.push("/admin")}
                                    >
                                        Admin Panel
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:flex cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transform hover:scale-105 transition-transform duration-300"
                                    onClick={() => signOut()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    ออกจากระบบ
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                        {/* Dashboard Tab */}
                        {activeTab === "dashboard" && (
                            <div>
                                {/* Statistics Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="card bg-white dark:bg-gray-800 shadow-xl p-6 rounded-xl transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex items-start space-x-4">
                                            <div className="text-primary bg-secondary bg-opacity-10 p-3 rounded-full flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-m font-semibold text-gray-500 dark:text-gray-400 mb-1">โครงการทั้งหมด</div>
                                                <div className="text-2xl font-bold mb-1">{projects.length}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">โครงการที่คุณสร้าง</div>
                                                
                                                {/* Status Details */}
                                                {projects.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">รอดำเนินการ</span>
                                                            </div>
                                                            <span className="text-sm font-semibold text-yellow-600">{projectStatusCounts.pending}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">อนุมัติแล้ว</span>
                                                            </div>
                                                            <span className="text-sm font-semibold text-green-600">{projectStatusCounts.approved}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">ไม่อนุมัติ</span>
                                                            </div>
                                                            <span className="text-sm font-semibold text-red-600">{projectStatusCounts.rejected}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card bg-white dark:bg-gray-800 shadow-xl p-6 rounded-xl transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex items-start space-x-4">
                                            <div className="text-secondary bg-primary bg-opacity-10 p-3 rounded-full flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-1">เอกสารทั้งหมด</div>
                                                <div className="text-2xl font-bold mb-1">{totalDocuments}</div>
                                                <div className="text-l text-gray-500 dark:text-gray-400">เอกสารที่คุณสร้าง</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card bg-white dark:bg-gray-800 shadow-xl p-6 rounded-xl transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex items-start space-x-4">
                                            <div className="text-accent bg-info bg-opacity-10 p-3 rounded-full flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8 stroke-current">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-1">โครงการล่าสุด</div>
                                                <div className="text-2xl font-bold mb-1 truncate">
                                                    {projects.length > 0 
                                                        ? truncateFileName(projects[0].name, 20)
                                                        : "ยังไม่มีโครงการ"}
                                                </div>
                                                <div className="text-l text-gray-500 dark:text-gray-400">
                                                    {projects.length > 0 
                                                        ? new Date(projects[0].created_at).toLocaleDateString("th-TH")
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
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            โครงการของฉัน
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">ดูและจัดการโครงการทั้งหมดของคุณ</p>
                                        <Button 
                                            onClick={() => setActiveTab("projects")}
                                            className="w-full cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                        >
                                            ดูโครงการทั้งหมด
                                        </Button>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                                        <h3 className="text-lg font-bold mb-4 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            สร้างโครงการใหม่
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">สร้างโครงการใหม่และเริ่มต้นจัดการเอกสาร</p>
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
                        )}

                        {/* Projects Tab */}
                        {activeTab === "projects" && (
                            <div>
                                {/* Header with Create Project Button */}
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        โครงการของฉัน ({projects.length} โครงการ)
                                    </h2>
                                    <Button
                                        onClick={() => setShowCreateProjectModal(true)}
                                        className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        สร้างโครงการใหม่
                                    </Button>
                                </div>

                                {/* Projects List */}
                                <div className="space-y-4">
                                    {projects.length > 0 ? (
                                        projects.map((project) => (
                                            <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                                                {/* Project Header */}
                                                <div 
                                                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-4 rounded-lg transition-colors duration-200"
                                                    onClick={() => toggleProjectExpansion(project.id)}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
                                                                    สร้างเมื่อ {new Date(project.created_at).toLocaleDateString("th-TH")}
                                                                </span>
                                                            </div>
                                                            {/* Project Status Badge */}
                                                            <div className="flex items-center mt-3">
                                                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 shadow-md ${getStatusColor(project.status || 'กำลังดำเนินการ')}`}>
                                                                    {/* Status Icon */}
                                                                    {(project.status || 'กำลังดำเนินการ') === 'อนุมัติ' && (
                                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                    {(project.status || 'กำลังดำเนินการ') === 'ไม่อนุมัติ' && (
                                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    )}
                                                                    {(project.status || 'กำลังดำเนินการ') === 'กำลังดำเนินการ' && (
                                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    )}
                                                                    สถานะ: {project.status || 'กำลังดำเนินการ'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Navigate to create document within this project
                                                                localStorage.setItem('selectedProjectId', project.id);
                                                                router.push('/createdocs');
                                                            }}
                                                            size="sm"
                                                            className="cursor-pointer"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            เพิ่มเอกสาร
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
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <svg 
                                                            xmlns="http://www.w3.org/2000/svg" 
                                                            className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                                                                expandedProjects.has(project.id) ? 'rotate-180' : ''
                                                            }`}
                                                            fill="none" 
                                                            viewBox="0 0 24 24" 
                                                            stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Project Documents - Expandable */}
                                                {expandedProjects.has(project.id) && (
                                                    <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                                                        {project.files.length > 0 ? (
                                                            <div className="grid grid-cols-1 gap-4">
                                                                {project.files.map((file) => (
                                                                    <React.Fragment key={file.id}>
                                                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                                            <div className="flex items-center space-x-3">
                                                                                <div className="flex-shrink-0">
                                                                                    {file.fileExtension === 'pdf' ? (
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                                        </svg>
                                                                                    ) : (
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                        </svg>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                                        {truncateFileName(file.originalFileName, 40)}
                                                                                    </p>
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <p className="text-sm text-gray-500">
                                                                                            {file.fileExtension.toUpperCase()} • {new Date(file.created_at).toLocaleDateString("th-TH")}
                                                                                        </p>
                                                                                        {file.attachmentFiles && file.attachmentFiles.length > 0 && (
                                                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                                                                {file.attachmentFiles.length} ไฟล์แนบ
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex space-x-2">
                                                                                <a
                                                                                    href={`/api/user-docs/download/${file.id}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="btn btn-sm bg-primary hover:bg-primary-focus text-white border-none rounded-full"
                                                                                    title="ดาวน์โหลด"
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                    </svg>
                                                                                </a>
                                                                                {file.fileExtension === 'pdf' && (
                                                                                    <Button
                                                                                        onClick={() => openPreviewModal(file.storagePath, file.originalFileName)}
                                                                                        size="sm"
                                                                                        className="rounded-full bg-green-500 text-white cursor-pointer hover:bg-green-600"
                                                                                        title="พรีวิว PDF"
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                        </svg>
                                                                                    </Button>
                                                                                )}
                                                                                <Button
                                                                                    onClick={() => handleDeleteFile(file.id)}
                                                                                    size="sm"
                                                                                    variant="destructive"
                                                                                    className="cursor-pointer rounded-full"
                                                                                    title="ลบไฟล์"
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                    </svg>
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                                                                        
                                                                        {/* แสดงไฟล์แนบ */}
                                                                        {file.attachmentFiles && file.attachmentFiles.length > 0 && (
                                                                            <div className="ml-12 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                                                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                                                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                                    </svg>
                                                                                    ไฟล์แนบ ({file.attachmentFiles.length} ไฟล์)
                                                                                </h5>
                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                    {file.attachmentFiles.map((attachment) => (
                                                                                        <div key={attachment.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                                                                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                                                                <div className="flex-shrink-0">
                                                                                                    {attachment.mimeType?.includes('image') ? (
                                                                                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                                        </svg>
                                                                                                    ) : attachment.mimeType?.includes('pdf') ? (
                                                                                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                                                        </svg>
                                                                                                    ) : (
                                                                                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                                        </svg>
                                                                                                    )}
                                                                                                </div>
                                                                                                <div className="flex-1 min-w-0">
                                                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={attachment.fileName}>
                                                                                                        {truncateFileName(attachment.fileName, 20)} (ไฟล์แนบ)
                                                                                                    </div>
                                                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                        {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <a
                                                                                                href={`/api/attachment/download/${attachment.id}`}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="flex-shrink-0 ml-1 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors duration-200"
                                                                                                title="ดาวน์โหลด"
                                                                                            >
                                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                                </svg>
                                                                                            </a>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">ยังไม่มีเอกสาร</h3>
                                                                <p className="mt-1 text-sm text-gray-500">เริ่มสร้างเอกสารแรกในโครงการนี้</p>
                                                                <div className="mt-4">
                                                                    <Button 
                                                                        onClick={() => {
                                                                            localStorage.setItem('selectedProjectId', project.id);
                                                                            router.push('/createdocs');
                                                                        }}
                                                                        size="sm"
                                                                    >
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
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">ยังไม่มีโครงการ</h3>
                                            <p className="mt-1 text-gray-500 dark:text-gray-400">เริ่มสร้างโครงการแรกของคุณ</p>
                                            <div className="mt-6">
                                                <Button onClick={() => setShowCreateProjectModal(true)}>
                                                    สร้างโครงการใหม่
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Orphan Files Section */}
                                    {orphanFiles.length > 0 && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                                เอกสารที่แนบหรืออัพโหลด ({orphanFiles.length} ไฟล์)
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 gap-2">
                                                {orphanFiles.map((file) => (
                                                    <div key={file.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0">
                                                                {file.fileExtension === 'pdf' ? (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {truncateFileName(file.originalFileName, 40)}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {file.fileExtension.toUpperCase()} • {new Date(file.created_at).toLocaleDateString("th-TH")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <a
                                                                href={`/api/user-docs/download/${file.id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-xs bg-primary hover:bg-primary-focus text-white border-none rounded-full"
                                                                title="ดาวน์โหลด"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Documents Tab - Legacy view for backward compatibility */}
                        {activeTab === "documents" && (
                            <div>
                                {/* Filter and Search Controls */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
                                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                                        <div className="w-full lg:w-auto">
                                            <Input
                                                type="text"
                                                placeholder="ค้นหาด้วยชื่อไฟล์..."
                                                className="input input-bordered w-full lg:w-80 rounded-full border-2"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                                            <select
                                                className="select select-bordered w-full lg:w-auto rounded-full border-2"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                            >
                                                <option value="createdAtDesc">เรียงตามวันที่สร้าง (ใหม่สุด)</option>
                                                <option value="createdAtAsc">เรียงตามวันที่สร้าง (เก่าสุด)</option>
                                            </select>
                                            <select
                                                className="select select-bordered w-full lg:w-auto rounded-full border-2"
                                                value={selectedFileType}
                                                onChange={(e) => setSelectedFileType(e.target.value)}
                                            >
                                                <option value="ทั้งหมด">ไฟล์ทั้งหมด</option>
                                                <option value="pdf">PDF</option>
                                                <option value="docx">Word</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Files Table */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                            เอกสารของคุณ ({totalItems} ไฟล์)
                                        </h2>
                                        {totalItems > 0 && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                แสดง {startIndex + 1}-{Math.min(endIndex, totalItems)} จาก {totalItems} รายการ
                                            </div>
                                        )}
                                    </div>

                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <span className="loading loading-spinner loading-lg text-primary"></span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">กำลังโหลดเอกสาร...</span>
                                        </div>
                                    ) : currentPageFiles.length > 0 ? (
                                        <>
                                            <div className="overflow-x-auto">
                                                <table className="table w-full">
                                                    <thead>
                                                        <tr className="text-lg text-gray-600 dark:text-gray-300">
                                                            <th>ชื่อไฟล์</th>
                                                            <th className="hidden md:table-cell">ประเภท</th>
                                                            <th className="hidden md:table-cell">วันที่สร้าง</th>
                                                            <th className="hidden sm:table-cell">ไฟล์แนบ</th>
                                                            <th>การกระทำ</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentPageFiles.map((file) => (
                                                            <React.Fragment key={file.id}>
                                                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                <td className="font-semibold">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="flex-shrink-0">
                                                                            {file.fileExtension === 'pdf' ? (
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                                </svg>
                                                                            ) : (
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-bold truncate max-w-full pr-2" title={file.originalFileName}>
                                                                                {truncateFileName(file.originalFileName, 35)}
                                                                            </div>
                                                                            <div className="text-sm opacity-50 md:hidden">
                                                                                {file.fileExtension.toUpperCase()} • {new Date(file.created_at).toLocaleDateString("th-TH")}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="text-gray-500 hidden md:table-cell">
                                                                    <span className="badge badge-outline">
                                                                        {file.fileExtension.toUpperCase()}
                                                                    </span>
                                                                </td>
                                                                <td className="text-gray-500 hidden md:table-cell">
                                                                    {new Date(file.created_at).toLocaleDateString("th-TH")}
                                                                </td>

                                                                {/* คอลัมน์ไฟล์แนบ */}
                                                                <td className="hidden sm:table-cell">
                                                                    {file.attachmentFiles && file.attachmentFiles.length > 0 ? (
                                                                        <button
                                                                            onClick={() => toggleRowExpansion(file.id)}
                                                                            className="flex items-center space-x-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm font-medium transition-colors duration-200"
                                                                        >
                                                                            <svg 
                                                                                xmlns="http://www.w3.org/2000/svg" 
                                                                                className={`h-4 w-4 transform transition-transform duration-200 ${expandedRows.has(file.id) ? 'rotate-180' : ''}`}
                                                                                fill="none" 
                                                                                viewBox="0 0 24 24" 
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                            </svg>
                                                                            <span>{file.attachmentFiles.length} ไฟล์</span>
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-sm">ไม่มี</span>
                                                                    )}
                                                                </td>
                                                               
                                                                <td>
                                                                    <div className="flex space-x-2">
                                                                        
                                                                        <a
                                                                            href={`/api/user-docs/download/${file.id}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-sm bg-primary hover:bg-primary-focus text-white border-none rounded-full shadow-md hover:shadow-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-200"
                                                                            title="ดาวน์โหลด"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                            </svg>
                                                                            <span className="ml-1 hidden lg:block">ดาวน์โหลด</span>
                                                                        </a>
                                                                        {file.fileExtension === 'pdf' && (
                                                                            <Button
                                                                                onClick={() =>
                                                                                    openPreviewModal(file.storagePath, file.originalFileName)
                                                                                }
                                                                                className=" rounded-full bg-green-500 text-white cursor-pointer hover:bg-green-600 transform hover:scale-105 transition-all duration-200"
                                                                                
                                                                                title="พรีวิว PDF"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                                </svg>
                                                                                <span className="ml-1 hidden lg:block">ดู</span>
                                                                            </Button>
                                                                        )}
                                                                        <Button
                                                                            onClick={() => handleDeleteFile(file.id)}
                                                                            disabled={isDeleting === file.id}
                                                                            className=" cursor-pointer text-white rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 hover:bg-red-700"
                                                                            title="ลบไฟล์"
                                                                            variant="destructive"
                                                                        >
                                                                            {isDeleting === file.id ? (
                                                                                <span className="loading loading-spinner loading-xs"></span>
                                                                            ) : (
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            )}
                                                                            <span className="ml-1 hidden lg:block">
                                                                                {isDeleting === file.id ? 'กำลังลบ...' : 'ลบ'}
                                                                            </span>
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                                </tr>

                                                                {/* แถวขยายสำหรับแสดงไฟล์แนบ */}
                                                                {expandedRows.has(file.id) && file.attachmentFiles && file.attachmentFiles.length > 0 && (
                                                                    <tr className="bg-gray-50 dark:bg-gray-800">
                                                                        <td colSpan={5} className="px-6 py-4">
                                                                            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                                                                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                                    </svg>
                                                                                    ไฟล์แนบ ({file.attachmentFiles.length} ไฟล์)
                                                                                </h4>
                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                                    {file.attachmentFiles.map((attachment, index) => (
                                                                                        <div key={attachment.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-600 p-3 rounded-lg border">
                                                                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                                                <div className="flex-shrink-0">
                                                                                                    {/* ไอคอนตามประเภทไฟล์ */}
                                                                                                    {attachment.mimeType?.includes('image') ? (
                                                                                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                                        </svg>
                                                                                                    ) : attachment.mimeType?.includes('pdf') ? (
                                                                                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                                                        </svg>
                                                                                                    ) : (
                                                                                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                                        </svg>
                                                                                                    )}
                                                                                                </div>
                                                                                                <div className="flex-1 min-w-0">
                                                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={attachment.fileName}>
                                                                                                        {truncateFileName(attachment.fileName, 25)}
                                                                                                    </div>
                                                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                        {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <a
                                                                                                href={`/api/attachment/download/${attachment.id}`}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="flex-shrink-0 ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors duration-200"
                                                                                                title="ดาวน์โหลด"
                                                                                            >
                                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                                </svg>
                                                                                            </a>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination Controls */}
                                            {totalPages > 1 && (
                                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        หน้า {currentPage} จาก {totalPages}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        {/* First Page Button */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={goToFirstPage}
                                                            disabled={currentPage === 1}
                                                            className="hidden sm:flex"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                                            </svg>
                                                        </Button>

                                                        {/* Previous Page Button */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={goToPreviousPage}
                                                            disabled={currentPage === 1}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                            <span className="hidden sm:inline ml-1">ก่อนหน้า</span>
                                                        </Button>

                                                        {/* Page Numbers */}
                                                        <div className="flex items-center gap-1">
                                                            {getPageNumbers().map((page, index) => (
                                                                page === '...' ? (
                                                                    <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">
                                                                        ...
                                                                    </span>
                                                                ) : (
                                                                    <Button
                                                                        key={page}
                                                                        variant={currentPage === page ? "default" : "outline"}
                                                                        size="sm"
                                                                        onClick={() => goToPage(Number(page))}
                                                                        className={`min-w-[2.5rem] ${
                                                                            currentPage === page 
                                                                                ? "bg-primary text-white" 
                                                                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                        }`}
                                                                    >
                                                                        {page}
                                                                    </Button>
                                                                )
                                                            ))}
                                                        </div>

                                                        {/* Next Page Button */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={goToNextPage}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            <span className="hidden sm:inline mr-1">ถัดไป</span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </Button>

                                                        {/* Last Page Button */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={goToLastPage}
                                                            disabled={currentPage === totalPages}
                                                            className="hidden sm:flex"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-12">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">ไม่พบเอกสาร</h3>
                                            <p className="mt-1 text-gray-500 dark:text-gray-400">เริ่มสร้างเอกสารแรกของคุณ</p>
                                            <div className="mt-6">
                                                <Button onClick={() => setActiveTab("create")}>
                                                    สร้างเอกสารใหม่
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Create Tab */}
                        {activeTab === "create" && (
                            <div>
                                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl text-center">
                                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">สร้างโครงการใหม่ | สร้างเอกสาร</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                                        เริ่มต้นด้วยการสร้างโครงการใหม่ หรือเลือกโครงการที่มีอยู่แล้วเพื่อเพิ่มเอกสาร
                                    </p>
                                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                                        <Button 
                                            size="lg"
                                            className="bg-primary hover:bg-primary-focus text-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                            onClick={() => setShowCreateProjectModal(true)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            สร้างโครงการใหม่
                                        </Button>
                                        <Button 
                                            size="lg"
                                            className="bg-green-500 hover:bg-green-600 text-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                            onClick={() => {
                                                if (projects.length === 0) {
                                                    setSuccessMessage("กรุณาสร้างโครงการก่อนเพื่อเริ่มสร้างเอกสาร");
                                                    setShowSuccessModal(true);
                                                    return;
                                                }
                                                router.push('/createdocs');
                                            }}
                                            
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            สร้างเอกสารในโครงการ
                                        </Button>
                                        <Button 
                                            size="lg"
                                            className="bg-info hover:bg-info-focus text-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                            onClick={() => router.push('/uploads-doc')}
                                            variant="outline"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 13l3-3m0 0l3 3m-3-3v12" />
                                            </svg>
                                            อัพโหลดเอกสาร
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Modal */}
                {showProfileModal && (
                    <dialog open className="modal modal-open backdrop-blur-sm">
                        <div className="modal-box w-11/12 max-w-md mx-auto animate-[modalSlideIn_0.3s_ease-out] relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
                                        <span className="text-white text-2xl font-bold">
                                            {session?.user?.name 
                                                ? session.user.name.charAt(0).toUpperCase() 
                                                : session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <h2 className="font-bold text-2xl text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                        ข้อมูลส่วนตัว
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                                        รายละเอียดบัญชีผู้ใช้
                                    </p>
                                </div>

                                {/* User Information */}
                                <div className="space-y-4 mb-6">
                                    <div className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-blue-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">ชื่อผู้ใช้</div>
                                                <div className="font-semibold">{session?.user?.name || 'ไม่ได้ระบุ'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-green-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">อีเมล</div>
                                                <div className="font-semibold">{session?.user?.email || 'ไม่ได้ระบุ'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-purple-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.586 1.414A11.955 11.955 0 0112 2.036 11.955 11.955 0 010 13.938V21.5h7.5v-7.562z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">บทบาท</div>
                                                <div className="font-semibold">{session?.user?.role || 'member'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end">
                                    <button
                                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                        onClick={() => setShowProfileModal(false)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </dialog>
                )}

                {/* PDF Preview Modal */}
                {isModalOpen && (
                    <dialog
                        id="pdf_preview_modal"
                        className="modal modal-open bg-black bg-opacity-50"
                    >
                        <div className="modal-box w-11/12 max-w-5xl h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                            <div className="flex items-center justify-between mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-lg">
                                    {previewTitle || "Preview"}
                                </h3>
                                <button
                                    className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-white"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="h-[calc(100%-64px)]">
                                <iframe
                                    src={previewUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 'none' }}
                                    title="PDF Preview"
                                />
                            </div>
                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button onClick={() => setIsModalOpen(false)}>close</button>
                        </form>
                    </dialog>
                )}

                {/* Delete Confirmation Modal */}
                <Dialog open={showDeleteModal} onOpenChange={(open) => {
                    setShowDeleteModal(open);
                    // Reset states when closing modal
                    if (!open) {
                        setFileToDelete(null);
                        setProjectToDelete(null);
                    }
                }}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    {fileToDelete ? "ยืนยันการลบไฟล์" : projectToDelete ? "ยืนยันการลบโครงการ" : "ยืนยันการลบ"}
                                </div>
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                                {fileToDelete 
                                    ? "คุณแน่ใจหรือไม่ที่จะลบไฟล์นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้" 
                                    : projectToDelete 
                                    ? "คุณแน่ใจหรือไม่ที่จะลบโครงการนี้? การดำเนินการนี้จะลบโครงการและเอกสารทั้งหมดที่เกี่ยวข้อง และไม่สามารถย้อนกลับได้"
                                    : "คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button 
                                variant="outline" 
                                onClick={cancelDelete}
                                className="w-full sm:w-auto mr-2"
                            >
                                ยกเลิก
                            </Button>
                            <Button 
                                onClick={fileToDelete ? confirmDeleteFile : projectToDelete ? confirmDeleteProject : cancelDelete}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                                disabled={Boolean((fileToDelete && isDeleting === fileToDelete) || (projectToDelete && isDeletingProject))}
                            >
                                {(fileToDelete && isDeleting === fileToDelete) || (projectToDelete && isDeletingProject) ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {fileToDelete ? "กำลังลบไฟล์..." : projectToDelete ? "กำลังลบโครงการ..." : "กำลังลบ..."}
                                    </div>
                                ) : (
                                    (fileToDelete ? "ลบไฟล์" : projectToDelete ? "ลบโครงการ" : "ลบ")
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Success Modal */}
                <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-green-600">
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {successMessage.includes('ข้อผิดพลาด') ? 'เกิดข้อผิดพลาด' : 'สำเร็จ!'}
                                </div>
                            </DialogTitle>
                            <DialogDescription className={`${successMessage.includes('ข้อผิดพลาด') ? 'text-red-600' : 'text-green-600'}`}>
                                {successMessage}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button 
                                onClick={() => setShowSuccessModal(false)}
                                className={`w-full ${successMessage.includes('ข้อผิดพลาด') ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                            >
                                ตกลง
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create Project Modal */}
                <Dialog open={showCreateProjectModal} onOpenChange={setShowCreateProjectModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>สร้างโครงการใหม่</DialogTitle>
                            <DialogDescription>
                                ป้อนข้อมูลโครงการใหม่ของคุณด้านล่าง
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="projectName" className="text-right text-sm font-medium">
                                    ชื่อโครงการ <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="projectName"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="col-span-3"
                                    placeholder="ระบุชื่อโครงการ"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="projectDescription" className="text-right text-sm font-medium">
                                    คำอธิบาย
                                </label>
                                <textarea
                                    id="projectDescription"
                                    value={newProjectDescription}
                                    onChange={(e) => setNewProjectDescription(e.target.value)}
                                    className="col-span-3 textarea textarea-bordered min-h-[100px]"
                                    placeholder="ระบุคำอธิบายโครงการ (ไม่บังคับ)"
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setShowCreateProjectModal(false);
                                    setNewProjectName("");
                                    setNewProjectDescription("");
                                }}
                                className="w-full sm:w-auto mr-2"
                            >
                                ยกเลิก
                            </Button>
                            <Button 
                                onClick={handleCreateProject}
                                className="w-full sm:w-auto"
                                disabled={!newProjectName.trim() || isCreatingProject}
                            >
                                {isCreatingProject ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        กำลังสร้าง...
                                    </div>
                                ) : (
                                    "สร้างโครงการ"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Project Modal */}
                <Dialog open={showEditProjectModal} onOpenChange={setShowEditProjectModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>แก้ไขโครงการ</DialogTitle>
                            <DialogDescription>
                                แก้ไขข้อมูลโครงการของคุณด้านล่าง
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="editProjectName" className="text-right text-sm font-medium">
                                    ชื่อโครงการ <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="editProjectName"
                                    value={editProjectName}
                                    onChange={(e) => setEditProjectName(e.target.value)}
                                    className="col-span-3"
                                    placeholder="ระบุชื่อโครงการ"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="editProjectDescription" className="text-right text-sm font-medium">
                                    คำอธิบาย
                                </label>
                                <textarea
                                    id="editProjectDescription"
                                    value={editProjectDescription}
                                    onChange={(e) => setEditProjectDescription(e.target.value)}
                                    className="col-span-3 textarea textarea-bordered min-h-[100px]"
                                    placeholder="ระบุคำอธิบายโครงการ (ไม่บังคับ)"
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setShowEditProjectModal(false);
                                    setProjectToEdit(null);
                                    setEditProjectName("");
                                    setEditProjectDescription("");
                                }}
                                className="w-full sm:w-auto mr-2"
                            >
                                ยกเลิก
                            </Button>
                            <Button 
                                onClick={confirmUpdateProject}
                                className="w-full sm:w-auto"
                                disabled={!editProjectName.trim() || isUpdatingProject}
                            >
                                {isUpdatingProject ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        กำลังอัปเดต...
                                    </div>
                                ) : (
                                    "อัปเดตโครงการ"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}