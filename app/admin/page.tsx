"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import Head from "next/head";

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
}

export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAtDesc");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalUsers , setTotalUsers] = useState(0)

    // State for managing the delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFileIdForDeletion, setSelectedFileIdForDeletion] = useState<string | null>(null);
    const [selectedFileNameForDeletion, setSelectedFileNameForDeletion] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
                    pdfUrl: `/api/download/${file.id}`,
                    originalFileName: file.originalFileName,
                    storagePath: file.storagePath,
                    created_at: file.created_at,
                    updated_at: file.updated_at,
                }));
                
                setPdfFiles(transformedFiles);
                const countUser = new Set(transformedFiles.map(f => f.userId)).size;
                setTotalUsers(countUser)
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
        } catch (error) {
            console.error("Failed to delete PDF file:", error);
            setError('ไม่สามารถลบเอกสารได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Data Filtering and Sorting ---
    const filteredAndSortedPdfs = useMemo(() => {
        let filtered = pdfFiles.filter(
            (file) =>
                file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (file.userName && file.userName.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            if (sortBy === "createdAtAsc") {
                return dateA - dateB;
            }
            return dateB - dateA;
        });

        return filtered;
    }, [searchTerm, sortBy, pdfFiles]);

    // Derived stats for the cards
    
    const latestFile = useMemo(() => {
        return filteredAndSortedPdfs.length > 0 ? filteredAndSortedPdfs[0] : null;
    }, [filteredAndSortedPdfs]);

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
            <Head>
                <title>Admin Dashboard | ระบบจัดการเอกสาร</title>
            </Head>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col">
                {/* --- Admin Navbar --- */}
                <div className="navbar bg-white dark:bg-gray-800 shadow-lg px-6 z-10 rounded-b-lg">
                    <div className="flex-1">
                        <Link href="/admin" className="btn btn-ghost text-xl text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <span className="ml-2 font-bold text-2xl">Admin Panel</span>
                        </Link>
                    </div>
                    <div className="flex-none">
                        <div className="flex items-center space-x-4">
                            <span className="hidden sm:block font-medium">
                                สวัสดี, {session.user?.name}
                            </span>
                            <Link href="/userdashboard" className="btn btn-secondary rounded-full shadow-lg">
                                กลับสู่แดชบอร์ดผู้ใช้
                            </Link>
                            <button onClick={() => signOut()} className="btn btn-primary rounded-full shadow-lg">
                                ออกจากระบบ
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Main Content Area --- */}
                <div className="container mx-auto p-6 flex-1">
                    <h1 className="text-4xl font-bold mb-6">ภาพรวมระบบ</h1>

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

                    {/* --- System Overview Cards --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center space-x-4">
                                <div className="text-primary bg-primary bg-opacity-10 p-3 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">จำนวนเอกสาร PDF</div>
                                    <div className="text-3xl font-bold">{pdfFiles.length}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">เอกสารทั้งหมดในระบบ</div>
                                </div>
                            </div>
                        </div>
                        <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center space-x-4">
                                <div className="text-secondary bg-secondary bg-opacity-10 p-3 rounded-full">
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
                        <div className="card bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center space-x-4">
                                <div className="text-info bg-info bg-opacity-10 p-3 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">เอกสารล่าสุด</div>
                                    <div className="text-lg font-bold truncate">
                                        {latestFile?.fileName || "ไม่มี"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {latestFile?.createdAt ? new Date(latestFile.createdAt).toLocaleDateString("th-TH") : ""}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- PDF Management Section --- */}
                    <h2 className="text-2xl font-bold mb-4">การจัดการเอกสาร PDF</h2>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อไฟล์ หรือ ผู้สร้าง..."
                            className="input input-bordered w-full sm:w-80 rounded-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="select select-bordered w-full sm:w-auto rounded-full"
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
                    </div>

                    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl mb-8">
                        <table className="table w-full">
                            <thead>
                                <tr className="text-lg text-gray-600 dark:text-gray-300">
                                    <th>ชื่อไฟล์</th>
                                    <th>ผู้สร้าง</th>
                                    <th className="hidden md:table-cell">สร้างเมื่อ</th>
                                    <th className="hidden md:table-cell">แก้ไขล่าสุด</th>
                                    <th>การกระทำ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedPdfs.length > 0 ? (
                                    filteredAndSortedPdfs.map((file) => (
                                        <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="font-semibold">{file.fileName}</td>
                                            <td>{file.userName || 'Unknown User'}</td>
                                            <td className="text-gray-500 hidden md:table-cell">
                                                {new Date(file.createdAt).toLocaleDateString("th-TH")}
                                            </td>
                                            <td className="text-gray-500 hidden md:table-cell">
                                                {new Date(file.lastModified).toLocaleDateString("th-TH")}
                                            </td>
                                            <td className="flex space-x-2">
                                                {file.storagePath && (
                                                    <a
                                                        href={file.storagePath}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-info text-white rounded-full"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        <span className="ml-1 hidden lg:block">ดาวน์โหลด</span>
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => openDeleteModal(file)}
                                                    className="btn btn-sm btn-error text-white rounded-full"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span className="ml-1 hidden lg:block">ลบ</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            {isLoading ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                    <span>กำลังโหลดข้อมูล...</span>
                                                </div>
                                            ) : (
                                                "ไม่พบเอกสาร PDF"
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- User Management Section --- */}
                    <h2 className="text-2xl font-bold mb-4">การจัดการผู้ใช้งาน</h2>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-lg">จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ</p>
                        <Link href="/admin/users" className="btn btn-secondary rounded-full shadow-lg">
                            ไปที่หน้าจัดการผู้ใช้งาน
                        </Link>
                    </div>
                </div>

                {/* --- Delete PDF Confirmation Modal --- */}
                {isDeleteModalOpen && selectedFileIdForDeletion && (
                    <dialog id="delete_pdf_modal" className="modal modal-open bg-black bg-opacity-50">
                        <div className="modal-box bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                            <h3 className="font-bold text-lg text-error">
                                ยืนยันการลบเอกสาร
                            </h3>
                            <p className="py-4">
                                คุณแน่ใจหรือไม่ว่าต้องการลบเอกสาร **{selectedFileNameForDeletion}**?
                            </p>
                            <p className="text-sm text-warning">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                            <div className="modal-action">
                                <button
                                    className="btn btn-error rounded-full"
                                    onClick={handleDeleteFile}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "กำลังลบ..." : "ลบ"}
                                </button>
                                <button className="btn rounded-full" onClick={closeDeleteModal}>
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button onClick={closeDeleteModal}>ปิด</button>
                        </form>
                    </dialog>
                )}
            </div>
        </>
    );
}