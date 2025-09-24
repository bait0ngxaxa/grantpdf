"use client";



import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";
import { Users } from "lucide-react";


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
    attachmentFiles?: AttachmentFile[]; // เพิ่มข้อมูลไฟล์แนบ
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

interface ProjectsResponse {
    projects: Project[];
    orphanFiles: PdfFile[];
}


const truncateFileName = (fileName: string | null | undefined, maxLength: number = 30): string => {
    // Handle null, undefined, or empty fileName
    if (!fileName || typeof fileName !== 'string') {
        return 'ไม่มีชื่อไฟล์';
    }
    
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop() || '';
    const lastDotIndex = fileName.lastIndexOf('.');
    
    // Handle files without extension
    if (lastDotIndex === -1) {
        return fileName.substring(0, maxLength - 3) + '...';
    }
    
    const nameWithoutExt = fileName.substring(0, lastDotIndex);
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
    
    return `${truncatedName}.${extension}`;
};

export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [orphanFiles, setOrphanFiles] = useState<PdfFile[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAtDesc");
    const [selectedFileType, setSelectedFileType] = useState("ไฟล์ทั้งหมด");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalUsers, setTotalUsers] = useState(0);
    
    // State for expandable projects
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    // State for tracking project statistics
    const [todayProjects, setTodayProjects] = useState(0);
    const [todayFiles, setTodayFiles] = useState(0);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // State for managing the delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFileIdForDeletion, setSelectedFileIdForDeletion] = useState<string | null>(null);
    const [selectedFileNameForDeletion, setSelectedFileNameForDeletion] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for success modal
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // เพิ่ม state สำหรับ PDF preview modal
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewFileName, setPreviewFileName] = useState("");

    
    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user?.role !== "admin") {
            router.push("/access-denied");
        }
    }, [session, status, router]);

    
    useEffect(() => {
        const fetchProjects = async () => {
            if (!session) return;
            
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await fetch('/api/admin/projects', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        throw new Error('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: ProjectsResponse = await response.json();
                console.log('Admin Projects API response:', data);
                
                setProjects(data.projects);
                setOrphanFiles(data.orphanFiles);
                
                // คำนวณ totalUsers จากโครงการที่มี
                const uniqueUserIds = new Set(data.projects.map(p => p.userId));
                setTotalUsers(uniqueUserIds.size);
                
                // คำนวณไฟล์ที่สร้างวันนี้
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const allFiles = [...data.orphanFiles, ...data.projects.flatMap(p => p.files)];
                const todayFilesCount = allFiles.filter(file => {
                    const fileDate = new Date(file.created_at);
                    return fileDate >= today && fileDate < tomorrow;
                }).length;
                
                // คำนวณโครงการที่สร้างวันนี้
                const todayProjectsCount = data.projects.filter(project => {
                    const projectDate = new Date(project.created_at);
                    return projectDate >= today && projectDate < tomorrow;
                }).length;
                
                setTodayProjects(todayProjectsCount);
                setTodayFiles(todayFilesCount);
            } catch (error) {
                console.error('Error fetching projects:', error);
                setError(error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง');
            } finally {
                setIsLoading(false);
            }
        };

        if (session && session.user?.role === "admin") {
            fetchProjects();
        }
    }, [session]);

    // --- Delete PDF Functions ---
    const openDeleteModal = (file: PdfFile) => {
        setSelectedFileIdForDeletion(file.id);
        setSelectedFileNameForDeletion(file.originalFileName);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedFileIdForDeletion(null);
        setSelectedFileNameForDeletion(null);
    };

    const handleDeleteFile = async () => {
        if (!selectedFileIdForDeletion) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/dashboard/file/${selectedFileIdForDeletion}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: selectedFileIdForDeletion }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            // Remove the file from projects and orphan files
            setProjects(prev => prev.map(project => ({
                ...project,
                files: project.files.filter(file => file.id !== selectedFileIdForDeletion)
            })));
            setOrphanFiles(prev => prev.filter(file => file.id !== selectedFileIdForDeletion));
            
            closeDeleteModal();
            
            // Show success modal instead of alert
            setSuccessMessage('ลบเอกสารสำเร็จแล้ว');
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Failed to delete PDF file:", error);
            setSuccessMessage('เกิดข้อผิดพลาดในการลบเอกสาร กรุณาลองใหม่อีกครั้ง');
            setIsSuccessModalOpen(true);
        } finally {
            setIsDeleting(false);
        }
    };

    // เพิ่ม functions สำหรับ PDF preview
    const openPreviewModal = (storagePath: string, fileName: string) => {
        setPreviewUrl(storagePath);
        setPreviewFileName(fileName);
        setIsPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
        setPreviewUrl("");
        setPreviewFileName("");
    };

    // Toggle expand/collapse for projects
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

    // --- Data Filtering and Sorting for Projects ---
    const filteredAndSortedProjects = useMemo(() => {
        // Filter projects by search term
        let filteredProjects = projects.filter((project) =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.files.some(file => 
                file.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

        // Filter orphan files
        let filteredOrphanFiles = orphanFiles.filter((file) =>
            file.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (file.userName && file.userName.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Filter by file type for orphan files
        if (selectedFileType !== "ไฟล์ทั้งหมด") {
            filteredOrphanFiles = filteredOrphanFiles.filter((file) =>
                file.fileExtension.toLowerCase() === selectedFileType.toLowerCase()
            );
            
            // Filter projects that have matching file types
            filteredProjects = filteredProjects.filter(project =>
                project.files.some(file => 
                    file.fileExtension.toLowerCase() === selectedFileType.toLowerCase()
                )
            );
        }

        // Sort projects
        filteredProjects.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            if (sortBy === "createdAtAsc") {
                return dateA - dateB;
            }
            return dateB - dateA;
        });

        // Sort orphan files
        filteredOrphanFiles.sort((a, b) => {
            if (sortBy === "statusDoneFirst") {
                if (a.downloadStatus === "done" && b.downloadStatus !== "done") {
                    return -1;
                }
                if (a.downloadStatus !== "done" && b.downloadStatus === "done") {
                    return 1;
                }
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateB - dateA;
            } else if (sortBy === "statusPendingFirst") {
                if (a.downloadStatus !== "done" && b.downloadStatus === "done") {
                    return -1;
                }
                if (a.downloadStatus === "done" && b.downloadStatus !== "done") {
                    return 1;
                }
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateB - dateA;
            } else {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                if (sortBy === "createdAtAsc") {
                    return dateA - dateB;
                }
                return dateB - dateA;
            }
        });

        return { projects: filteredProjects, orphanFiles: filteredOrphanFiles };
    }, [searchTerm, sortBy, selectedFileType, projects, orphanFiles]);

    // Pagination calculations
    const totalItems = filteredAndSortedProjects.projects.length + filteredAndSortedProjects.orphanFiles.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Combine projects and orphan files for pagination
    const allItems = [...filteredAndSortedProjects.projects, ...filteredAndSortedProjects.orphanFiles];
    const currentPageItems = allItems.slice(startIndex, endIndex);

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

    // Derived stats for the cards
    const allFiles = [...orphanFiles, ...projects.flatMap(p => p.files)];
    const latestFile = useMemo(() => {
        const sortedFiles = allFiles.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return sortedFiles.length > 0 ? sortedFiles[0] : null;
    }, [allFiles]);

    // Dynamic title based on active tab
    const getTitleByTab = (tab: string) => {
        switch(tab) {
            case "dashboard":
                return "Admin Dashboard - ภาพรวมระบบ | ระบบจัดการเอกสาร";
            case "projects":
                return "Admin Dashboard - จัดการโครงการและเอกสาร | ระบบจัดการเอกสาร";
            case "users":
                return "Admin Dashboard - จัดการผู้ใช้งาน | ระบบจัดการเอกสาร";
            default:
                return "Admin Dashboard | ระบบจัดการเอกสาร";
        }
    };

    // Set dynamic title
    useTitle(getTitleByTab(activeTab));

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

    const menuItems = [
        {
            id: "dashboard",
            name: "ภาพรวมระบบ",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            )
        },
        {
            id: "projects",
            name: "จัดการโครงการและเอกสาร",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            id: "users",
            name: "จัดการผู้ใช้งาน",
            icon: (
                                <Users className="h-5 w-5" />
            )
        }
    ];

    return (
        <>
            {/* Remove Head component */}
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
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-focus rounded-lg flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.586 1.414A11.955 11.955 0 0112 2.036 11.955 11.955 0 010 13.938V21.5h7.5v-7.562z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-primary">Admin Panel</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ระบบจัดการ</p>
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
                                                ? 'bg-primary text-white shadow-md'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {item.icon}
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        {/* Add counters for relevant items */}
                                        {item.id === 'users' && totalUsers > 0 && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                activeTab === item.id 
                                                    ? 'bg-white/20 text-white' 
                                                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                            }`}>
                                                {totalUsers}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        
                        {/* Quick Stats Section */}
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">สถิติวันนี้</h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">โครงการใหม่:</span>
                                    <span className="font-semibold text-green-600">{todayProjects}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">ไฟล์ใหม่:</span>
                                    <span className="font-semibold text-orange-600">{todayFiles}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">รวมโครงการ:</span>
                                    <span className="font-semibold text-blue-600">{projects.length}</span>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* User Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                    {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-m font-medium text-gray-900 dark:text-white truncate">
                                    {session.user?.name || 'Admin'}
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
                            กลับสู่แดชบอร์ดผู้ใช้
                        </Button>
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
                                    {menuItems.find(item => item.id === activeTab)?.name || 'Admin Dashboard'}
                                </h1>
                            </div>
                            <div className="hidden sm:flex items-center space-x-4">
                                <span className="text-m font-semibold text-gray-600 dark:text-gray-400">
                                    {session.user?.name} ({session.user?.role})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                        {/* Error Alert */}
                        {error && (
                            <div className="alert alert-error mb-6 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                                <button 
                                    className="btn btn-sm btn-outline"
                                    onClick={() => setError(null)}
                                >
                                    ปิด
                                </button>
                            </div>
                        )}

                        {/* Dashboard Tab */}
                        {activeTab === "dashboard" && (
                            <div>
                                {/* System Overview Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    {/* Total Projects Card */}
                                    <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => setActiveTab("projects")}>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-blue-600 bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">โครงการทั้งหมด</div>
                                                <div className="text-3xl font-bold text-blue-600">{projects.length}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">โครงการในระบบ</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Today's New Projects Card */}
                                    <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-green-600 bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">โครงการใหม่วันนี้</div>
                                                <div className="text-3xl font-bold text-green-600">{todayProjects}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">โครงการที่สร้างวันนี้</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Total Documents Card */}
                                    <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => setActiveTab("documents")}>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-purple-600 bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">จำนวนเอกสาร</div>
                                                <div className="text-3xl font-bold text-purple-600">{allFiles.length}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">เอกสารทั้งหมดในระบบ</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Today's New Files Card */}
                                    <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-orange-600 bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">ไฟล์ใหม่วันนี้</div>
                                                <div className="text-3xl font-bold text-orange-600">{todayFiles}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ไฟล์ที่เข้ามาวันนี้</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Secondary Stats Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {/* Users Card */}
                                    <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => setActiveTab("users")}>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20 p-3 rounded-full">
                                                <Users className="h-8 w-8 stroke-current" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">ผู้ใช้งานทั้งหมด</div>
                                                <div className="text-3xl font-bold text-indigo-600">{totalUsers}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">บัญชีผู้ใช้ในระบบ</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Latest File Card */}
                                    <div className="card col-span-1 md:col-span-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-teal-600 bg-teal-100 dark:bg-teal-900/20 p-3 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">เอกสารล่าสุด</div>
                                                <div className="text-lg font-bold truncate max-w-full text-teal-600" title={latestFile?.originalFileName || ""}>
                                                    {latestFile?.originalFileName ? truncateFileName(latestFile.originalFileName, 35) : "ไม่มี"}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {latestFile?.createdAt ? new Date(latestFile.createdAt).toLocaleDateString("th-TH") : ""}
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            การจัดการเอกสาร
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">ดู จัดการ และลบเอกสารทั้งหมดในระบบ</p>
                                        <Button 
                                            onClick={() => setActiveTab("documents")}
                                            className="w-full cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                        >
                                            เข้าสู่การจัดการเอกสาร
                                        </Button>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                                        <h3 className="text-lg font-bold mb-4 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197a4 4 0 11-7.32 0l3.66 1.83z" />
                                            </svg>
                                            การจัดการผู้ใช้งาน
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ</p>
                                        <Button 
                                            onClick={() => setActiveTab("users")}
                                            className="w-full cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                            variant="outline"
                                        >
                                            เข้าสู่การจัดการผู้ใช้งาน
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Projects Tab */}
                        {activeTab === "projects" && (
                            <div>
                                {/* Search and Filter Controls */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อโครงการ, ไฟล์ หรือ ผู้สร้าง..."
                                        className="input input-bordered w-full sm:w-80 rounded-full border-2"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <select
                                            className="select select-bordered w-full sm:w-auto rounded-full border-2"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="createdAtDesc">
                                                เรียงตามวันที่สร้าง (ใหม่สุด)
                                            </option>
                                            <option value="createdAtAsc">
                                                เรียงตามวันที่สร้าง (เก่าสุด)
                                            </option>
                                            <option value="statusDoneFirst">
                                                เรียงตามสถานะ (เสร็จก่อน)
                                            </option>
                                            <option value="statusPendingFirst">
                                                เรียงตามสถานะ (รอก่อน)
                                            </option>
                                        </select>
                                        <select
                                            className="select select-bordered w-full sm:w-auto rounded-full border-2"
                                            value={selectedFileType}
                                            onChange={(e) => setSelectedFileType(e.target.value)}
                                        >
                                            <option value="ไฟล์ทั้งหมด">ไฟล์ทั้งหมด</option>
                                            <option value="pdf">PDF</option>
                                            <option value="docx">Word</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            จัดการโครงการและเอกสาร
                                        </h2>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                โครงการใหม่วันนี้: <span className="font-semibold text-green-600">{todayProjects}</span>
                                            </div>
                                            {totalItems > 0 && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    แสดง {startIndex + 1}-{Math.min(endIndex, totalItems)} จาก {totalItems} รายการ
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <span className="loading loading-spinner loading-lg text-primary"></span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">กำลังโหลดโครงการ...</span>
                                        </div>
                                    ) : filteredAndSortedProjects.projects.length > 0 ? (
                                        <>
                                            {/* Projects with Files Section */}
                                            {filteredAndSortedProjects.projects.map((project) => (
                                                <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-6 cursor-pointer hover:from-blue-100 hover:to-blue-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300"
                                                        onClick={() => toggleProjectExpansion(project.id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex-shrink-0">
                                                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                                        {project.name}
                                                                    </h3>
                                                                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                                                                        <span className="flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                            </svg>
                                                                            {project.userName}
                                                                        </span>
                                                                        <span className="flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                            </svg>
                                                                            {project._count.files} ไฟล์
                                                                        </span>
                                                                        <span className="flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 0h4a2 2 0 002-2V9a2 2 0 00-2-2h-4m-6-3h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                                                                            </svg>
                                                                            {new Date(project.created_at).toLocaleDateString("th-TH")}
                                                                        </span>
                                                                    </div>
                                                                    {project.description && (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">
                                                                            {project.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <div className="text-right">
                                                                    <div className="text-2xl font-bold text-blue-600">{project._count.files}</div>
                                                                    <div className="text-xs text-gray-500">ไฟล์</div>
                                                                </div>
                                                                <svg 
                                                                    xmlns="http://www.w3.org/2000/svg" 
                                                                    className={`h-6 w-6 text-gray-400 transform transition-transform duration-300 ${
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
                                                    </div>

                                                    {/* Expanded Files Section */}
                                                    {expandedProjects.has(project.id) && project.files.length > 0 && (
                                                        <div className="border-t border-gray-200 dark:border-gray-600">
                                                            <div className="p-6 bg-white dark:bg-gray-800">
                                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                    ไฟล์ในโครงการ ({project.files.length} ไฟล์)
                                                                </h4>
                                                                <div className="grid gap-4">
                                                                    {project.files.map((file) => (
                                                                        <React.Fragment key={file.id}>
                                                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                                    <div className="flex-shrink-0">
                                                                                        {file.fileExtension === 'pdf' ? (
                                                                                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                                            </svg>
                                                                                        ) : (
                                                                                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                            </svg>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                                                                            {truncateFileName(file.originalFileName, 50)}
                                                                                        </div>
                                                                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                                            <span className="badge badge-outline text-xs">
                                                                                                {file.fileExtension.toUpperCase()}
                                                                                            </span>
                                                                                            <span>{new Date(file.created_at).toLocaleDateString("th-TH")}</span>
                                                                                            {file.attachmentFiles && file.attachmentFiles.length > 0 && (
                                                                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                                                                    {file.attachmentFiles.length} ไฟล์แนบ
                                                                                                </span>
                                                                                            )}
                                                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                                                file.downloadStatus === "done" 
                                                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                                                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                                            }`}>
                                                                                                {file.downloadStatus === "done" ? "เสร็จ" : "ใหม่"}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                                                    {/* Download Button */}
                                                                                    {file.storagePath && (
                                                                                        <a
                                                                                            href={`/api/admin/download/${file.id}`}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="btn btn-sm bg-primary hover:bg-blue-600 text-white border-none rounded-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                                                                                            title="ดาวน์โหลด"
                                                                                        >
                                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                            </svg>
                                                                                        </a>
                                                                                    )}
                                                                                    
                                                                                    {/* Preview Button */}
                                                                                    {file.fileExtension === 'pdf' && (
                                                                                        <Button
                                                                                            onClick={() => openPreviewModal(file.storagePath, file.originalFileName)}
                                                                                            className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none rounded-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                                                                                            title="พรีวิว PDF"
                                                                                        >
                                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                            </svg>
                                                                                        </Button>
                                                                                    )}
                                                                                    
                                                                                    {/* Delete Button */}
                                                                                    <Button
                                                                                        onClick={() => openDeleteModal(file)}
                                                                                        className="btn btn-sm cursor-pointer text-white border-none rounded-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                                                                                        variant="destructive"
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
                                                                                                            {truncateFileName(attachment.fileName, 25)}
                                                                                                        </div>
                                                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                            {attachment.fileSize > 0 ? (attachment.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'ไม่ทราบขนาด'}
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
                                                                            )}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}


                                        </>
                                    ) : (
                                        <div className="text-center py-12">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">ไม่พบโครงการ</h3>
                                            <p className="mt-1 text-gray-500 dark:text-gray-400">ไม่มีโครงการในระบบหรือไม่พบโครงการที่ตรงกับการค้นหา</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Documents Tab */}
                        {activeTab === "documents" && (
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อโครงการ, ไฟล์ หรือ ผู้สร้าง..."
                                        className="input input-bordered w-full sm:w-80 rounded-full border-2"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <select
                                            className="select select-bordered w-full sm:w-auto rounded-full border-2"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="createdAtDesc">
                                                เรียงตามวันที่สร้าง (ใหม่สุด)
                                            </option>
                                            <option value="createdAtAsc">
                                                เรียงตามวันที่สร้าง (เก่าสุด)
                                            </option>
                                            <option value="statusDoneFirst">
                                                เรียงตามสถานะ (เสร็จก่อน)
                                            </option>
                                            <option value="statusPendingFirst">
                                                เรียงตามสถานะ (รอก่อน)
                                            </option>
                                        </select>
                                        <select
                                            className="select select-bordered w-full sm:w-auto rounded-full border-2"
                                            value={selectedFileType}
                                            onChange={(e) => setSelectedFileType(e.target.value)}
                                        >
                                            <option value="ไฟล์ทั้งหมด">ไฟล์ทั้งหมด</option>
                                            <option value="pdf">PDF</option>
                                            <option value="docx">Word</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                            โครงการทั้งหมด ({filteredAndSortedProjects.projects.length} โครงการ)
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
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">กำลังโหลดโครงการ...</span>
                                        </div>
                                    ) : filteredAndSortedProjects.projects.length > 0 ? (
                                        <>
                                            {/* Projects Section */}
                                            {filteredAndSortedProjects.projects.map((project) => (
                                                <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-xl mb-6 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                                    {/* Project Header */}
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-4 cursor-pointer hover:from-blue-100 hover:to-blue-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300"
                                                        onClick={() => toggleProjectExpansion(project.id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex-shrink-0">
                                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                                        {project.name}
                                                                    </h3>
                                                                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-300">
                                                                        <span className="flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                            </svg>
                                                                            {project.userName}
                                                                        </span>
                                                                        <span className="flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 0h4a2 2 0 002-2V9a2 2 0 00-2-2h-4m-6-3h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                                                                            </svg>
                                                                            {project._count.files} ไฟล์
                                                                        </span>
                                                                        <span className="flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 0h4a2 2 0 002-2V9a2 2 0 00-2-2h-4m-6-3h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                                                                            </svg>
                                                                            {new Date(project.created_at).toLocaleDateString("th-TH")}
                                                                        </span>
                                                                    </div>
                                                                    {project.description && (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 truncate">
                                                                            {project.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <svg 
                                                                    xmlns="http://www.w3.org/2000/svg" 
                                                                    className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${
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
                                                    </div>

                                                    {/* Expanded Files Section */}
                                                    {expandedProjects.has(project.id) && (
                                                        <div className="border-t border-gray-200 dark:border-gray-600">
                                                            <div className="p-4 bg-white dark:bg-gray-800">
                                                                <div className="space-y-3">
                                                                    {project.files.map((file) => (
                                                                        <React.Fragment key={file.id}>
                                                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                                    {/* File Icon */}
                                                                                    <div className="flex-shrink-0">
                                                                                        {file.fileExtension === 'pdf' ? (
                                                                                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                                            </svg>
                                                                                        ) : (
                                                                                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                            </svg>
                                                                                        )}
                                                                                    </div>
                                                                                    
                                                                                    {/* File Info */}
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center space-x-2">
                                                                                            <span className="font-medium text-gray-900 dark:text-white truncate">
                                                                                                {file.attachmentFiles && file.attachmentFiles.length > 0 ? 
                                                                                                    `${truncateFileName(file.originalFileName, 40)}` : 
                                                                                                    truncateFileName(file.originalFileName, 40)
                                                                                                }
                                                                                            </span>
                                                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                                                file.downloadStatus === "done" 
                                                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                                                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                                            }`}>
                                                                                                {file.downloadStatus === "done" ? "เสร็จ" : "ใหม่"}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                                            <span className="flex items-center">
                                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 0h4a2 2 0 002-2V9a2 2 0 00-2-2h-4m-6-3h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                                                                                                </svg>
                                                                                                {new Date(file.created_at).toLocaleDateString("th-TH")}
                                                                                            </span>
                                                                                            <span className="badge badge-outline text-xs">
                                                                                                {file.fileExtension.toUpperCase()}
                                                                                            </span>
                                                                                            {file.attachmentFiles && file.attachmentFiles.length > 0 && (
                                                                                                <button
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        toggleRowExpansion(file.id);
                                                                                                    }}
                                                                                                    className="flex items-center space-x-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-xs font-medium transition-colors duration-200"
                                                                                                >
                                                                                                    <svg 
                                                                                                        xmlns="http://www.w3.org/2000/svg" 
                                                                                                        className={`h-3 w-3 transform transition-transform duration-200 ${
                                                                                                            expandedRows.has(file.id) ? 'rotate-180' : ''
                                                                                                        }`}
                                                                                                        fill="none" 
                                                                                                        viewBox="0 0 24 24" 
                                                                                                        stroke="currentColor"
                                                                                                    >
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                                    </svg>
                                                                                                    <span>{file.attachmentFiles.length} ไฟล์แนบ</span>
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {/* Action Buttons */}
                                                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                                                    {/* Download Button */}
                                                                                    {file.storagePath && (
                                                                                        <a
                                                                                            href={`/api/admin/download/${file.id}`}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="btn btn-sm bg-primary hover:bg-blue-600 text-white border-none rounded-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                                                                                            onClick={() => {
                                                                                                setTimeout(() => {
                                                                                                    window.location.reload();
                                                                                                }, 1000);
                                                                                            }}
                                                                                            title="ดาวน์โหลด"
                                                                                        >
                                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                            </svg>
                                                                                        </a>
                                                                                    )}
                                                                                    
                                                                                    {/* Preview Button */}
                                                                                    {file.fileExtension === 'pdf' && (
                                                                                        <Button
                                                                                            onClick={() => openPreviewModal(file.storagePath, file.originalFileName)}
                                                                                            className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none rounded-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                                                                                            title="พรีวิว PDF"
                                                                                        >
                                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                                            </svg>
                                                                                        </Button>
                                                                                    )}
                                                                                    
                                                                                    {/* Delete Button */}
                                                                                    <Button
                                                                                        onClick={() => openDeleteModal(file)}
                                                                                        className="btn btn-sm cursor-pointer text-white border-none rounded-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                                                                                        variant="destructive"
                                                                                        title="ลบไฟล์"
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                        </svg>
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {/* Attachment Files Section */}
                                                                            {expandedRows.has(file.id) && file.attachmentFiles && file.attachmentFiles.length > 0 && (
                                                                                <div className="ml-12 mt-2 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                                                                                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                                                                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                                        </svg>
                                                                                        ไฟล์แนบ ({file.attachmentFiles.length} ไฟล์)
                                                                                    </h5>
                                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                        {file.attachmentFiles.map((attachment) => (
                                                                                            <div key={attachment.id} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded border">
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
                                                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={`${attachment.fileName} (ไฟล์แนบ)`}>
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
                                                                                                    className="flex-shrink-0 ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors duration-200"
                                                                                                    title="ดาวน์โหลดไฟล์แนบ"
                                                                                                >
                                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                           

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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">ไม่พบโครงการ</h3>
                                            <p className="mt-1 text-gray-500 dark:text-gray-400">ไม่มีโครงการในระบบหรือไม่พบโครงการที่ตรงกับการค้นหา</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === "users" && (
                            <div>
                                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl text-center">
                                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <Users className="h-10 w-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">การจัดการผู้ใช้งาน</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                                        จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ ดู แก้ไข และจัดการสิทธิ์การเข้าถึงของผู้ใช้
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                                            <div className="text-2xl font-bold text-primary">{totalUsers}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">ผู้ใช้งานทั้งหมด</div>
                                        </div>
                                        <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                                            <div className="text-2xl font-bold text-success">Active</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">สถานะผู้ใช้</div>
                                        </div>
                                        <div className="bg-info/10 p-4 rounded-lg border border-info/20">
                                            <div className="text-2xl font-bold text-info">{allFiles.length}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">เอกสารที่สร้าง</div>
                                        </div>
                                    </div>
                                    <Button 
                                        size="lg"
                                        className="hover:bg-secondary-focus text-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                        onClick={() => router.push("/admin/users")}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        เข้าสู่การจัดการผู้ใช้งาน
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Delete PDF Confirmation Modal --- */}
                {isDeleteModalOpen && selectedFileIdForDeletion && (
                    <dialog className="modal modal-open">
                        <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
                            <h3 className="font-bold text-lg text-red-600 mb-4">ยืนยันการลบเอกสาร</h3>
                            <div className="py-4">
                                <p className="text-gray-700 dark:text-gray-300 mb-2">
                                    คุณแน่ใจหรือไม่ว่าต้องการลบเอกสาร <strong className="text-gray-900 dark:text-white">{selectedFileNameForDeletion}</strong>?
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    การกระทำนี้ไม่สามารถย้อนกลับได้
                                </p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={closeDeleteModal}
                                    className="cursor-pointer px-4 py-2"
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    onClick={handleDeleteFile}
                                    disabled={isDeleting}
                                    className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {isDeleting ? 'กำลังลบ...' : 'ลบ'}
                                </Button>
                            </div>
                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button onClick={closeDeleteModal}>ปิด</button>
                        </form>
                    </dialog>
                )}

                {/* --- Success Modal --- */}
                {isSuccessModalOpen && (
                    <dialog className="modal modal-open">
                        <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                    successMessage.includes('ข้อผิดพลาด') 
                                        ? 'bg-red-100 dark:bg-red-900/20' 
                                        : 'bg-green-100 dark:bg-green-900/20'
                                }`}>
                                    {successMessage.includes('ข้อผิดพลาด') ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className={`font-bold text-lg mb-2 ${
                                    successMessage.includes('ข้อผิดพลาด') ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {successMessage.includes('ข้อผิดพลาด') ? 'เกิดข้อผิดพลาด!' : 'สำเร็จ!'}
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-6">
                                    {successMessage}
                                </p>
                                <Button
                                    onClick={() => setIsSuccessModalOpen(false)}
                                    className={`w-full ${
                                        successMessage.includes('ข้อผิดพลาด') 
                                            ? 'bg-red-600 hover:bg-red-700' 
                                            : 'bg-green-600 hover:bg-green-700'
                                    } text-white`}
                                >
                                    ตกลง
                                </Button>
                            </div>
                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button onClick={() => setIsSuccessModalOpen(false)}>ปิด</button>
                        </form>
                    </dialog>
                )}

                {/* เพิ่ม PDF Preview Modal */}
                {isPreviewModalOpen && (
                    <dialog className="modal modal-open">
                        <div className="modal-box w-11/12 max-w-5xl h-[90vh] bg-white dark:bg-gray-800">
                            <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
                                    พรีวิว: {previewFileName}
                                </h3>
                                <button
                                    className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                    onClick={closePreviewModal}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="h-[calc(100%-80px)]">
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
                            <button onClick={closePreviewModal}>ปิด</button>
                        </form>
                    </dialog>
                )}
            </div>
        </>
    );
}