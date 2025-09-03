"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";

// Interface for PDF file data from API
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
    downloadStatus: string; // เพิ่มฟิลด์นี้
    downloadedAt?: string;  // เพิ่มฟิลด์นี้ (ถ้าต้องการ)
}

// เพิ่มฟังก์ชันตัดชื่อไฟล์ที่ด้านบนของไฟล์ (หลัง import statements)
const truncateFileName = (fileName: string, maxLength: number = 30): string => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop() || '';
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
    
    return `${truncatedName}.${extension}`;
};

export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAtDesc");
    const [selectedFileType, setSelectedFileType] = useState("ทั้งหมด");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalUsers , setTotalUsers] = useState(0)
    const [todayFiles, setTodayFiles] = useState(0) // เพิ่ม state ใหม่
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

    // --- Authorization Check ---
    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user?.role !== "admin") {
            router.push("/access-denied");
        }
    }, [session, status, router]);

    // --- Fetch PDF files from API ---
    useEffect(() => {
        const fetchPdfFiles = async () => {
            if (!session) return;
            
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await fetch('/api/admin/dashboard', {
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

                const data = await response.json();
                
                // Transform API data to match our interface
                const transformedFiles: PdfFile[] = data.map((file: any) => ({
                    id: file.id,
                    fileName: file.originalFileName,
                    createdAt: file.created_at,
                    lastModified: file.updated_at,
                    userId: file.userId,
                    userName: file.userName,
                    userEmail: file.userEmail,
                    pdfUrl: `/api/admin/download/${file.id}`, // เปลี่ยนจาก /api/download เป็น /api/admin/download
                    originalFileName: file.originalFileName,
                    storagePath: file.storagePath,
                    created_at: file.created_at,
                    updated_at: file.updated_at,
                    fileExtension: file.fileExtension,
                    downloadStatus: file.downloadStatus || "pending", // เพิ่มฟิลด์นี้
                    downloadedAt: file.downloadedAt, // เพิ่มฟิลด์นี้
                }));
                
                setPdfFiles(transformedFiles);
                const countUser = new Set(transformedFiles.map(f => f.userId)).size;
                setTotalUsers(countUser);
                
                // คำนวณไฟล์ที่สร้างวันนี้
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const todayFilesCount = transformedFiles.filter(file => {
                    const fileDate = new Date(file.createdAt);
                    return fileDate >= today && fileDate < tomorrow;
                }).length;
                
                setTodayFiles(todayFilesCount);
            } catch (error) {
                console.error('Error fetching PDF files:', error);
                setError(error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลเอกสารได้ กรุณาลองใหม่อีกครั้ง');
            } finally {
                setIsLoading(false);
            }
        };

        if (session && session.user?.role === "admin") {
            fetchPdfFiles();
        }
    }, [session]);

    // --- Delete PDF Functions ---
    const openDeleteModal = (file: PdfFile) => {
        setSelectedFileIdForDeletion(file.id);
        setSelectedFileNameForDeletion(file.fileName);
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

            // Remove the file from the local state
            setPdfFiles((prevFiles) => prevFiles.filter((file) => file.id !== selectedFileIdForDeletion));
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

    // --- Data Filtering and Sorting with Pagination ---
    const filteredAndSortedPdfs = useMemo(() => {
        let filtered = pdfFiles.filter(
            (file) =>
                file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (file.userName && file.userName.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Filter by file type
        if (selectedFileType !== "ทั้งหมด") {
            filtered = filtered.filter((file) =>
                file.fileExtension.toLowerCase() === selectedFileType.toLowerCase()
            );
        }

        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            if (sortBy === "createdAtAsc") {
                return dateA - dateB;
            }
            return dateB - dateA;
        });

        return filtered;
    }, [searchTerm, sortBy, selectedFileType, pdfFiles]);

    // Pagination calculations
    const totalItems = filteredAndSortedPdfs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageFiles = filteredAndSortedPdfs.slice(startIndex, endIndex);

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
    
    const latestFile = useMemo(() => {
        return filteredAndSortedPdfs.length > 0 ? filteredAndSortedPdfs[0] : null;
    }, [filteredAndSortedPdfs]);

    // Dynamic title based on active tab
    const getTitleByTab = (tab: string) => {
        switch(tab) {
            case "dashboard":
                return "Admin Dashboard - ภาพรวมระบบ | ระบบจัดการเอกสาร";
            case "documents":
                return "Admin Dashboard - จัดการเอกสาร | ระบบจัดการเอกสาร";
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
            id: "documents",
            name: "จัดการเอกสาร",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            id: "users",
            name: "จัดการผู้ใช้งาน",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197a4 4 0 11-7.32 0l3.66 1.83z" />
                </svg>
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
                    <nav className="p-4">
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => {
                                            setActiveTab(item.id);
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-primary bg-secondary bg-opacity-10 p-3 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">จำนวนเอกสาร</div>
                                                <div className="text-3xl font-bold">{pdfFiles.length}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">เอกสารทั้งหมดในระบบ</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-white bg-green-400 bg-opacity-10 p-3 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">ไฟล์ใหม่วันนี้</div>
                                                <div className="text-3xl font-bold text-black">{todayFiles}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ไฟล์ที่เข้ามาวันนี้</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-secondary bg-primary bg-opacity-10 p-3 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.972 5.972 0 01-.569-2.533v-.001c0-.246.04-.487.117-.709A5.972 5.972 0 018 12a5.972 5.972 0 01.117-.709c.077-.222.117-.463.117-.709v-.001a5.972 5.972 0 01-.569-2.533m0 0a5.972 5.972 0 015.411-.533M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22L12 18.77L5.82 22L7 14.14l-5-4.87L8.91 8.26L12 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">ผู้ใช้งานทั้งหมด</div>
                                                <div className="text-3xl font-bold">{totalUsers}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">บัญชีผู้ใช้ในระบบ</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="card w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-info bg-accent bg-opacity-10 p-3 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">เอกสารล่าสุด</div>
                                                <div className="text-lg font-bold truncate max-w-full" title={latestFile?.fileName || ""}>
                                                    {latestFile?.fileName ? truncateFileName(latestFile.fileName, 25) : "ไม่มี"}
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

                        {/* Documents Tab */}
                        {activeTab === "documents" && (
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อไฟล์ หรือ ผู้สร้าง..."
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
                                        </select>
                                        <select
                                            className="select select-bordered w-full sm:w-auto rounded-full border-2"
                                            value={selectedFileType}
                                            onChange={(e) => setSelectedFileType(e.target.value)}
                                        >
                                            <option value="ทั้งหมด">ทั้งหมด</option>
                                            <option value="pdf">PDF</option>
                                            <option value="docx">Word</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                            เอกสารทั้งหมด ({totalItems} ไฟล์)
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
                                                            <th>ผู้สร้าง</th>
                                                            <th className="hidden md:table-cell">สร้างเมื่อ</th>
                                                            <th className="hidden md:table-cell">ประเภทเอกสาร</th>
                                                            <th className="hidden lg:table-cell">สถานะ</th>
                                                            <th>การกระทำ</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentPageFiles.map((file) => (
                                                            <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                <td className="font-semibold">
                                                                    <div className="truncate max-w-xs pr-2" title={file.fileName}>
                                                                        {truncateFileName(file.fileName, 30)}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="truncate max-w-32" title={file.userName || 'Unknown User'}>
                                                                        {file.userName || 'Unknown User'}
                                                                    </div>
                                                                </td>
                                                                <td className="text-gray-500 hidden md:table-cell">
                                                                    {new Date(file.createdAt).toLocaleDateString("th-TH")}
                                                                </td>
                                                                <td className="text-gray-500 hidden md:table-cell">
                                                                    <span className="badge badge-outline">
                                                                        {file.fileExtension.toUpperCase()}
                                                                    </span>
                                                                </td>
                                                                <td className="hidden lg:table-cell">
                                                                    <span className={`badge ${
                                                                        file.downloadStatus === "done" 
                                                                            ? "badge badge-outline badge-success border border-green-500 p-2" 
                                                                            : "badge badge-outline badge-warning border border-yellow-500 p-2"
                                                                    }`}>
                                                                        {file.downloadStatus === "done" ? "ดำเนินการแล้ว" : "รอดำเนินการ"}
                                                                    </span>
                                                                </td>
                                                                <td className="flex space-x-2">
                                                                    {file.storagePath && (
                                                                        <a
                                                                            href={`/api/admin/download/${file.id}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-sm bg-primary hover:bg-primary-focus hover:bg-blue-600 text-white border-none rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                                                            onClick={() => {
                                                                                setTimeout(() => {
                                                                                    window.location.reload();
                                                                                }, 1000);
                                                                            }}
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                            </svg>
                                                                            <span className="ml-1 hidden lg:block">
                                                                                {file.downloadStatus === "done" ? "ดาวน์โหลดอีกครั้ง" : "ดาวน์โหลด"}
                                                                            </span>
                                                                        </a>
                                                                    )}
                                                                    
                                                                    {/* เพิ่มปุ่มพรีวิว PDF */}
                                                                    {file.fileExtension === 'pdf' && (
                                                                        <Button
                                                                            onClick={() => openPreviewModal(file.storagePath, file.originalFileName)}
                                                                            className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                                                            title="พรีวิว PDF"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                            </svg>
                                                                            <span className="ml-1 hidden lg:block">พรีวิว</span>
                                                                        </Button>
                                                                    )}
                                                                    
                                                                    <Button
                                                                        onClick={() => openDeleteModal(file)}
                                                                        className=" cursor-pointer text-white border-none rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                                                        variant="destructive"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        <span className="ml-1 hidden lg:block">ลบ</span>
                                                                    </Button>
                                                                </td>
                                                            </tr>
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
                                            <p className="mt-1 text-gray-500 dark:text-gray-400">ไม่มีเอกสารในระบบหรือไม่พบเอกสารที่ตรงกับการค้นหา</p>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197a4 4 0 11-7.32 0l3.66 1.83z" />
                                        </svg>
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
                                            <div className="text-2xl font-bold text-info">{pdfFiles.length}</div>
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
                                        เข้าสู่การจัดการผู้ใช้งานแบบละเอียด
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