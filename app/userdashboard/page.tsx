"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// API Response type for better type safety
type UserFile = {
    id: string;
    originalFileName: string;
    storagePath: string;
    created_at: string;
    updated_at: string;
    fileExtension: string;
    userName:string;
    
};

// This is the new list of departments based on your mock data,
// but in a real app, this should probably come from a separate API or config.
const departmentList = [
    {
        name: "ทั้งหมด",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                />
            </svg>
        ),
    },
    {
        name: "สัญญาจ้างทั่วไป",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3-.895-3-2 1.343-2 3-2zM9 14c0 1.657 1.343 3 3 3s3-1.343 3-3-1.343-3-3-3-3 1.343-3 3z"
                />
            </svg>
        ),
    },
    {
        name: "ขอบเขตการดำเนินงาน (TORS)",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 8v8m-4-4v4m-4-4v4m-1.5-4h-2m13 0h-2m2 0a2 2 0 012 2v8a2 2 0 01-2 2h-12a2 2 0 01-2-2v-8a2 2 0 012-2h12a2 2 0 012 2z"
                />
            </svg>
        ),
    },
    
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
    const [count , setCount] = useState(1);

    // New state for profile modal
    const [showProfileModal, setShowProfileModal] = useState(false);

    // New state for fetching data from the API
    const [userFiles, setUserFiles] = useState<UserFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user documents from the API
    const fetchUserFiles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/user-docs");
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
            file.originalFileName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
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
    }, [userFiles, searchTerm, sortBy]);

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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                />
                            </svg>
                            <span className="ml-2 font-bold text-2xl ">
                                ระบบจัดการเอกสาร
                            </span>
                        </Link>
                    </div>
                    <div className="flex-none">
                        {session && (
                            
                            
                            <div className="flex items-center space-x-4">
                                <div className="dropdown dropdown-end">
                                    
                                    <div
                                        tabIndex={0}
                                        role="button"
                                        className="cursor-pointer"
                                    >
                                        
                                        
                                        <Button
                                            variant="ghost"
                                            className=" font-bold text-l"
                                        >
                                            <div className="avatar">
                                            <div className="w-8 rounded-full">
                                                {session.user?.image ? (
                                                    <img 
                                                        src={session.user.image} 
                                                        alt="Profile"
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="avatar placeholder justify-center mr-2">
                                                        <div className="bg-primary text-primary-content rounded-full w-8 text-center">
                                                            <span className="text-lg">
                                                                {session.user?.name 
                                                                    ? session.user.name.charAt(0).toUpperCase() 
                                                                    : session.user?.email?.charAt(0).toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                            
                                             {session.user?.name}
                                            <svg
                                                className="h-4 w-4 transition-transform duration-200"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </Button>
                                        {/* <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg> */}
                                    </div>
                                    <ul
                                        tabIndex={0}
                                        className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                                    >
                                        <li>
                                            <button
                                                onClick={() =>
                                                    setShowProfileModal(true)
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    />
                                                </svg>
                                                ข้อมูลส่วนตัว
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => signOut()}>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                    />
                                                </svg>
                                                ออกจากระบบ
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                {session.user?.role === "admin" && (
                                    <Button
                                        variant={"outline"}
                                        className="font-bold"
                                    >
                                        <Link href="/admin">
                                            แผงควบคุมแอดมิน
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-1 pt-6 px-6">
                    {/* Sidebar */}
                    <aside className="w-64 bg-white dark:bg-gray-800 p-4 mr-6 shadow-xl rounded-box hidden md:block">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                            หน่วยงาน
                        </h2>
                        <ul className="menu">
                            {departmentList.map((department) => (
                                <li key={department.name}>
                                    <a
                                        className={`font-semibold ${
                                            selectedDepartment ===
                                            department.name
                                                ? "active bg-primary text-white"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedDepartment(
                                                department.name
                                            )
                                        }
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
                            <Button className="border-2">
                                <Link
                                    href="/createdocs"
                                    className="flex flex-wrap items-center gap-2 md:flex-row"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="ml-2 font-bold">
                                        สร้างเอกสารใหม่
                                    </span>
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                            <Input
                                type="text"
                                placeholder="ค้นหาชื่อไฟล์..."
                                className="input input-bordered w-full sm:w-80 rounded-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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
                        </div>

                        {/* Document List (Table) */}
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                            <table className="table w-full">
                                <thead>
                                    <tr className="text-lg text-gray-600 dark:text-gray-300 font-bold">
                                        
                                        <th>ชื่อไฟล์</th>
                                        <th>ประเภทเอกสาร</th>
                                        <th className="hidden md:table-cell">
                                            สร้างเมื่อ
                                        </th>
                                        {/* <th className="hidden md:table-cell">
                                            สร้างโดย
                                        </th> */}
                                        <th>การกระทำ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedFiles.length > 0 ? (
                                        filteredAndSortedFiles.map((file) => (
                                            <tr
                                                key={file.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                
                                                <td className="font-semibold">
                                                    {file.originalFileName}
                                                </td>
                                                <td> - </td>
                                                <td className="text-gray-500 hidden md:table-cell">
                                                    {new Date(
                                                        file.created_at
                                                    ).toLocaleDateString(
                                                        "th-TH"
                                                    )}
                                                </td>
                                                {/* <td className="text-gray-500 hidden md:table-cell">
                                                    {
                                                        file.userName
                                                    }
                                                </td> */}
                                                <td className="flex space-x-2">
                                                    <Button
                                                        onClick={() =>
                                                            window.open(
                                                                file.storagePath,
                                                                "_blank"
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                        <span className="ml-1 hidden lg:block">
                                                            พรีวิว
                                                        </span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="text-center py-4 text-gray-500"
                                            >
                                                ไม่พบเอกสาร 
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </main>
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
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-10 w-10 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="font-bold text-2xl text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                        ข้อมูลส่วนตัว
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                                        รายละเอียดบัญชีผู้ใช้
                                    </p>
                                </div>

                                {/* User Info */}
                                <div className="space-y-4 mb-6">
                                    {/* ชื่อผู้ใช้ */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-blue-500">
                                        <div className="flex items-center mb-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-blue-500 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                ชื่อผู้ใช้
                                            </p>
                                        </div>
                                        <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                            {session?.user?.name || "ไม่ระบุ"}
                                        </p>
                                    </div>

                                    {/* อีเมล */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-purple-500">
                                        <div className="flex items-center mb-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-purple-500 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                อีเมล
                                            </p>
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {session?.user?.email || "ไม่ระบุ"}
                                        </p>
                                    </div>

                                    {/* สถานะ */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-amber-500">
                                        <div className="flex items-center mb-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-amber-500 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                />
                                            </svg>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                สถานะ
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                    session?.user?.role ===
                                                    "admin"
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                }`}
                                            >
                                                {session?.user?.role === "admin"
                                                    ? "ผู้ดูแลระบบ"
                                                    : "ผู้ใช้ทั่วไป"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* จำนวนเอกสาร */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-green-500">
                                        <div className="flex items-center mb-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-green-500 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                จำนวนเอกสาร
                                            </p>
                                        </div>
                                        <p className="font-semibold text-green-600 dark:text-green-400 text-lg">
                                            {userFiles.length} ไฟล์
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end">
                                    <button
                                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                        onClick={() =>
                                            setShowProfileModal(false)
                                        }
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
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

                {/* Animation Keyframes */}
                <style jsx global>{`
                    @keyframes modalSlideIn {
                        0% {
                            opacity: 0;
                            transform: translateY(-20px) scale(0.95);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                `}</style>
            </div>
        </>
    );
}
