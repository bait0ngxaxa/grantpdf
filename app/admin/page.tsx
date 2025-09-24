'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";
import { Users } from "lucide-react";

// Import components
import SearchAndFilter from './components/SearchAndFilter';
import ProjectsList from './components/ProjectsList';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';


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
    const [selectedStatus, setSelectedStatus] = useState("สถานะทั้งหมด"); // เพิ่ม filter สำหรับสถานะ
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

    // State สำหรับการจัดการสถานะโครงการ
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedProjectForStatus, setSelectedProjectForStatus] = useState<Project | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);


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

    // --- PDF Preview Functions ---
    const openPreviewModal = (storagePath: string, fileName: string) => {
        // Extract filename from storagePath if needed
        const filename = storagePath.split('/').pop() || storagePath;
        setPreviewUrl(`/api/admin/preview/${filename}`);
        setPreviewFileName(fileName);
        setIsPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
        setPreviewUrl("");
        setPreviewFileName("");
    };

    // --- Project Status Management Functions ---
    const openStatusModal = (project: Project) => {
        setSelectedProjectForStatus(project);
        setNewStatus(project.status);
        setIsStatusModalOpen(true);
    };

    const closeStatusModal = () => {
        setIsStatusModalOpen(false);
        setSelectedProjectForStatus(null);
        setNewStatus("");
    };

    const handleUpdateProjectStatus = async () => {
        if (!selectedProjectForStatus || !newStatus) return;

        setIsUpdatingStatus(true);
        try {
            const response = await fetch('/api/admin/projects', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: selectedProjectForStatus.id,
                    status: newStatus
                }),
            });

            if (!response.ok) {
                throw new Error('ไม่สามารถอัปเดตสถานะโครงการได้');
            }

            const result = await response.json();

            // อัปเดตสถานะใน state
            setProjects(prev => prev.map(project => 
                project.id === selectedProjectForStatus.id 
                    ? { ...project, status: newStatus, updated_at: new Date().toISOString() }
                    : project
            ));
            
            closeStatusModal();
            
            // แสดงข้อความสำเร็จ
            setSuccessMessage(result.message || 'อัปเดตสถานะโครงการสำเร็จแล้ว');
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Failed to update project status:", error);
            setSuccessMessage('เกิดข้อผิดพลาดในการอัปเดตสถานะโครงการ กรุณาลองใหม่อีกครั้ง');
            setIsSuccessModalOpen(true);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // ฟังก์ชั่นให้ได้สีตามสถานะ
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

// Filter and sort data
    const filteredAndSortedProjects = useMemo(() => {
        let filteredProjects = projects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                project.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                project.files.some(file => 
                                    file.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
                                );
            
            // กรองตามประเภทไฟล์
            let matchesFileType = true;
            if (selectedFileType !== "ไฟล์ทั้งหมด") {
                matchesFileType = project.files.some(file => 
                    file.fileExtension.toLowerCase() === selectedFileType.toLowerCase()
                );
            }
            
            // กรองตามสถานะโครงการ
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
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case "createdAtDesc":
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case "statusDoneFirst":
                    const aDoneCount = a.files.filter(f => f.downloadStatus === "done").length;
                    const bDoneCount = b.files.filter(f => f.downloadStatus === "done").length;
                    return bDoneCount - aDoneCount;
                case "statusPendingFirst":
                    const aPendingCount = a.files.filter(f => f.downloadStatus !== "done").length;
                    const bPendingCount = b.files.filter(f => f.downloadStatus !== "done").length;
                    return bPendingCount - aPendingCount;
                case "statusApproved":
                    return (b.status === "อนุมัติ" ? 1 : 0) - (a.status === "อนุมัติ" ? 1 : 0);
                case "statusPending":
                    return (b.status === "กำลังดำเนินการ" ? 1 : 0) - (a.status === "กำลังดำเนินการ" ? 1 : 0);
                case "statusRejected":
                    return (b.status === "ไม่อนุมัติ" ? 1 : 0) - (a.status === "ไม่อนุมัติ" ? 1 : 0);
            }
        });

        return { projects: filteredProjects, orphanFiles };
    }, [projects, orphanFiles, searchTerm, selectedFileType, selectedStatus, sortBy]);

    // Calculate all files for stats
    const allFiles = useMemo(() => {
        return [...orphanFiles, ...projects.flatMap(p => p.files)];
    }, [orphanFiles, projects]);

    // Calculate latest file
    const latestFile = useMemo(() => {
        const sortedFiles = allFiles.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return sortedFiles.length > 0 ? sortedFiles[0] : null;
    }, [allFiles]);

    // Pagination
    const totalItems = filteredAndSortedProjects.projects.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProjects = filteredAndSortedProjects.projects.slice(startIndex, endIndex);

    // Toggle functions
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

    // Menu items
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
            id: "documents",
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
            icon: <Users className="h-5 w-5" />
        }
    ];

    // Dynamic title based on active tab
    const getTitleByTab = (tab: string) => {
        switch(tab) {
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

    return (
        <>
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
                            <div className="flex items-center space-x-4">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => signOut()}
                                    className="cursor-pointer"
                                >
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
                                {/* System Overview Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    {/* Total Projects Card */}
                                    <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
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
                                                    {latestFile?.created_at ? new Date(latestFile.created_at).toLocaleDateString("th-TH") : ""}
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
                                        <div className="btn-group">
                                            {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => (
                                                <button
                                                    key={i + 1}
                                                    className={`btn ${currentPage === i + 1 ? 'btn-active' : ''}`}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
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

                {/* --- Project Status Management Modal --- */}
                {isStatusModalOpen && selectedProjectForStatus && (
                    <dialog className="modal modal-open">
                        <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
                            <h3 className="font-bold text-lg text-primary mb-4">จัดการสถานะโครงการ</h3>
                            <div className="py-4">
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    โครงการ: <strong className="text-gray-900 dark:text-white">{selectedProjectForStatus.name}</strong>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    สถานะปัจจุบัน: <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedProjectForStatus.status)}`}>{selectedProjectForStatus.status}</span>
                                </p>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">สถานะใหม่:</span>
                                    </label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                                        <option value="อนุมัติ">อนุมัติ</option>
                                        <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={closeStatusModal}
                                    className="cursor-pointer px-4 py-2"
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    onClick={handleUpdateProjectStatus}
                                    disabled={isUpdatingStatus || newStatus === selectedProjectForStatus.status}
                                    className={`cursor-pointer px-4 py-2 ${newStatus === selectedProjectForStatus.status ? 'opacity-50' : ''}`}
                                >
                                    {isUpdatingStatus ? 'กำลังอัปเดต...' : 'อัปเดตสถานะ'}
                                </Button>
                            </div>
                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button onClick={closeStatusModal}>ปิด</button>
                        </form>
                    </dialog>
                )}
            </div>
        </>
    );
}