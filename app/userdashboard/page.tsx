"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import Head from "next/head";

// API Response type for better type safety
type UserFile = {
    id: string;
    originalFileName: string;
    storagePath: string;
    created_at: string;
    updated_at: string;
};

// This is the new list of departments based on your mock data,
// but in a real app, this should probably come from a separate API or config.
const departmentList = [
    { name: "ทั้งหมด", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    )},
    { name: "ฝ่ายว่าง", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3-.895-3-2 1.343-2 3-2zM9 14c0 1.657 1.343 3 3 3s3-1.343 3-3-1.343-3-3-3-3 1.343-3 3z" />
        </svg>
    )},
    { name: "ฝ่ายไม่ทำ", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-4v4m-4-4v4m-1.5-4h-2m13 0h-2m2 0a2 2 0 012 2v8a2 2 0 01-2 2h-12a2 2 0 01-2-2v-8a2 2 0 012-2h12a2 2 0 012 2z" />
        </svg>
    )},
    { name: "ฝ่ายนอน", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9v6m-4-4v4m-4-4v4m-1.5-4h-2m13 0h-2m2 0a2 2 0 012 2v8a2 2 0 01-2 2h-12a2 2 0 01-2-2v-8a2 2 0 012-2h12a2 2 0 012 2z" />
        </svg>
    )},
];

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAtDesc");
    const [selectedDepartment, setSelectedDepartment] = useState("ทั้งหมด");
    
    // New state for fetching data from the API
    const [userFiles, setUserFiles] = useState<UserFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // Fetch user documents from the API
    const fetchUserFiles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/user-docs"); // Your API endpoint
            if (!res.ok) {
                throw new Error("Failed to fetch user documents");
            }
            const data: UserFile[] = await res.json();
            setUserFiles(data);
        } catch (err) {
            console.error("Error fetching documents:", err);
            setError("ไม่สามารถโหลดเอกสารได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin");
        } else if (status === "authenticated") {
            fetchUserFiles();
        }
    }, [status, router]);

    const openPreviewModal = (url: string, title: string) => {
        setPreviewUrl(url);
        setPreviewTitle(title);
        setIsModalOpen(true);
    };

    const closePreviewModal = () => {
        setIsModalOpen(false);
        setPreviewUrl("");
        setPreviewTitle("");
    };

    // Filter and sort the actual data from the API
    const filteredAndSortedFiles = useMemo(() => {
        let filtered = userFiles;

        // Note: The API does not provide a 'department' field.
        // The filter by department is kept for consistency with the original code,
        // but it will not filter any documents unless you add 'department' to your API response.
        // if (selectedDepartment !== "ทั้งหมด") {
        //     filtered = filtered.filter((file) => file.department === selectedDepartment);
        // }

        // Filter by search term
        filtered = filtered.filter((file) =>
            file.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
        );

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
    }, [userFiles, searchTerm, sortBy]); // Removed `selectedDepartment` from dependency array as it's not being used for filtering the real data

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

    return (
        <>
            <Head>
                <title>Dashboard | ระบบจัดการเอกสาร</title>
            </Head>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col">
                <div className="navbar bg-white dark:bg-gray-800 shadow-lg px-6 z-10 rounded-b-lg">
                    <div className="flex-1">
                        <Link
                            href="/userdashboard"
                            className="btn btn-ghost text-xl text-primary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <span className="ml-2 font-bold text-2xl">ระบบจัดการเอกสาร</span>
                        </Link>
                    </div>
                    <div className="flex-none">
                        {session && (
                            <div className="flex items-center space-x-4">
                                <span className="hidden sm:block font-medium">
                                    สวัสดี, {session.user?.name}
                                </span>
                                {session.user?.role === "admin" && (
                                    <Link
                                        href="/admin"
                                        className="btn btn-secondary rounded-full shadow-lg"
                                    >
                                        แผงควบคุมแอดมิน
                                    </Link>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className="btn btn-primary rounded-full shadow-lg"
                                >
                                    ออกจากระบบ
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-1 pt-6 px-6">
                    {/* Sidebar */}
                    <aside className="w-64 bg-white dark:bg-gray-800 p-4 mr-6 shadow-xl rounded-box hidden md:block">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">หน่วยงาน</h2>
                        <ul className="menu">
                            {departmentList.map((department) => (
                                <li key={department.name}>
                                    <a
                                        className={`font-semibold ${selectedDepartment === department.name ? "active bg-primary text-white" : ""}`}
                                        onClick={() => setSelectedDepartment(department.name)}
                                    >
                                        {department.icon}
                                        {department.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold mb-4 md:mb-0">
                                เอกสารของฉัน ({selectedDepartment})
                            </h1>
                            <Link href="/createdocs" className="btn btn-primary rounded-full shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-2">สร้างเอกสารใหม่</span>
                            </Link>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อไฟล์..."
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

                        {/* Document List (Table) */}
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                            <table className="table w-full">
                                <thead>
                                    <tr className="text-lg text-gray-600 dark:text-gray-300">
                                        <th>ชื่อไฟล์</th>
                                        <th className="hidden md:table-cell">สร้างเมื่อ</th>
                                        <th className="hidden md:table-cell">แก้ไขล่าสุด</th>
                                        <th>การกระทำ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedFiles.length > 0 ? (
                                        filteredAndSortedFiles.map((file) => (
                                            <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="font-semibold">{file.originalFileName}</td>
                                                <td className="text-gray-500 hidden md:table-cell">
                                                    {new Date(file.created_at).toLocaleDateString("th-TH")}
                                                </td>
                                                <td className="text-gray-500 hidden md:table-cell">
                                                    {new Date(file.updated_at).toLocaleDateString("th-TH")}
                                                </td>
                                                <td className="flex space-x-2">
                                                    <button
                                                        onClick={() => openPreviewModal(file.storagePath, file.originalFileName)}
                                                        className="btn btn-sm btn-success text-white rounded-full"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <span className="ml-1 hidden lg:block">พรีวิว</span>
                                                    </button>
                                                    <Link
                                                        href={`/edit/${file.id}`}
                                                        className="btn btn-sm btn-info text-white rounded-full"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        <span className="ml-1 hidden lg:block">แก้ไข</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="text-center py-4 text-gray-500"
                                            >
                                                ไม่พบเอกสาร PDF
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </main>
                </div>

                {/* PDF Preview Modal */}
                {isModalOpen && (
                    <dialog id="pdf_preview_modal" className="modal modal-open bg-black bg-opacity-50">
                        <div className="modal-box w-11/12 max-w-5xl h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                            <div className="flex items-center justify-between mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-lg">
                                    {previewTitle}
                                </h3>
                                <button
                                    className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-white"
                                    onClick={closePreviewModal}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="h-[calc(100%-64px)]">
                                <iframe
                                    src={previewUrl}
                                    title={previewTitle}
                                    width="100%"
                                    height="100%"
                                    className="border-2 border-gray-300 dark:border-gray-700 rounded-lg"
                                >
                                    เบราว์เซอร์ของคุณไม่รองรับการแสดงผล PDF
                                </iframe>
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