"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";
import { useSession } from "next-auth/react";

// Define the type for the form data to ensure type safety
interface TorsData {
    projectName: string;
    clientName: string;
    projectDescription: string;
    scopeOfWork: string;
    startDate: string;
    endDate: string;
    budget: number;
    contactPerson: string;
}

// Define the type for project templates
interface ProjectTemplate {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    initialData: TorsData;
}

export default function CreateTorsPage() {
    const router = useRouter();
    const { status } = useSession();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [projectsPerPage] = useState(5); // Show 5 projects per page
    
    // Calculate pagination
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(projects.length / projectsPerPage);
    
    useTitle("เลือกเอกสารที่สร้าง | ระบบจัดการเอกสาร");
    
    // Fetch user projects
    useEffect(() => {
        const fetchProjects = async () => {
            if (status !== "authenticated") return;
            
            try {
                const res = await fetch("/api/projects");
                if (!res.ok) {
                    throw new Error("Failed to fetch projects");
                }
                const data = await res.json();
                setProjects(data.projects);
                
                // Check if there's a selected project from localStorage
                const storedProjectId = localStorage.getItem('selectedProjectId');
                if (storedProjectId && data.projects.some((p: any) => p.id === storedProjectId)) {
                    setSelectedProjectId(storedProjectId);
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("ไม่สามารถโหลดโครงการได้");
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchProjects();
    }, [status]);
    
    // Handle project selection
    const handleProjectSelection = (projectId: string) => {
        setSelectedProjectId(projectId);
        localStorage.setItem('selectedProjectId', projectId);
    };
    
    // Handle back to project selection
    const handleBackToProjects = () => {
        setSelectedProjectId(null);
        localStorage.removeItem('selectedProjectId');
    };
    
    // ✅ ฟังก์ชันสำหรับการ redirect ไป /create-word-doc
    const handleApprovalSelection = (templateId: string, title: string) => {
        // เก็บข้อมูล template ใน localStorage เพื่อนำไปใช้ในหน้า create-word-doc
        const templateData = {
            id: templateId,
            title: title,
        };
        localStorage.setItem('selectedApprovalTemplate', JSON.stringify(templateData));
        // redirect ไปหน้า create-word-doc
        router.push('/create-word-approval');
    };

    const handleContractSelection = (templateId: string, title: string) => {
        // เก็บข้อมูล template ใน localStorage เพื่อนำไปใช้ในหน้า create-word-doc
        const templateData = {
            id: templateId,
            title: title,
        };
        localStorage.setItem('selectedTorsTemplate', JSON.stringify(templateData));
        // redirect ไปหน้า create-word-doc
        router.push('/create-word-contract');
    };

    const handleFormProjectSelection = (templateId: string, title: string) => {
        // เก็บข้อมูล template ใน localStorage เพื่อนำไปใช้ในหน้า create-word-doc
        const templateData = {
            id: templateId,
            title: title,
        };
        localStorage.setItem('selectedTorsTemplate', JSON.stringify(templateData));
        // redirect ไปหน้า create-word-doc
        router.push('/create-word-formproject');
    };

    const handleTorSelection = (templateId: string, title: string) => {
        // เก็บข้อมูล template ใน localStorage เพื่อนำไปใช้ในหน้า create-word-doc
        const templateData = {
            id: templateId,
            title: title,
        };
        localStorage.setItem('selectedTorsTemplate', JSON.stringify(templateData));
        // redirect ไปหน้า create-word-doc
        router.push('/create-word-tor');
    };
    
    // Handle back button logic
    const handleBack = () => {
        if (selectedProjectId) {
            handleBackToProjects();
        } else if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            router.push('/userdashboard');
        }
    };

    // Handle category selection
    const handleCategorySelection = (category: string) => {
        setSelectedCategory(category);
    };

    // Render project selection
    const renderProjectSelection = () => (
        <div className="container mx-auto max-w-6xl bg-base-100 p-8 rounded-xl shadow-xl flex-grow flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-center mb-8">เลือกโครงการสำหรับเอกสาร</h1>
            
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <span className="ml-4">กำลังโหลดโครงการ...</span>
                </div>
            ) : error ? (
                <div className="text-center py-12 text-red-500">
                    <p>{error}</p>
                    <Button 
                        onClick={() => router.push('/userdashboard')} 
                        className="mt-4"
                    >
                        กลับไปแดชบอร์ด
                    </Button>
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">ยังไม่มีโครงการ</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">กรุณาสร้างโครงการก่อนสร้างเอกสาร</p>
                    <div className="mt-6">
                        <Button onClick={() => router.push('/userdashboard')}>
                            สร้างโครงการใหม่
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
                        {currentProjects.map((project) => (
                            <div
                                key={project.id}
                                className={`card bg-base-100 shadow-md cursor-pointer transition-all duration-200 border-2 ${selectedProjectId === project.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary'} hover:bg-base-200`}
                                onClick={() => handleProjectSelection(project.id)}
                            >
                                <div className="card-body p-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-2 line-clamp-1">{project.name}</h3>
                                            <p className="text-sm text-base-content/60 mb-3 line-clamp-2 overflow-hidden text-ellipsis break-words">
                                                {project.description || "ไม่มีคำอธิบาย"}
                                            </p>
                                            <div className="flex items-center space-x-4 text-xs text-base-content/60">
                                                <span className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    {project.files.length} เอกสาร
                                                </span>
                                                <span className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 6h6m-6 4h6m-7-6h1m-1 4h1m5-10V3a1 1 0 00-1-1H9a1 1 0 00-1 1v4H7a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1h-1z" />
                                                    </svg>
                                                    สร้าง {new Date(project.created_at).toLocaleDateString("th-TH")}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center space-x-3">
                                            {selectedProjectId === project.id && (
                                                <div className="badge badge-primary badge-lg">เลือกแล้ว</div>
                                            )}
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                className="h-6 w-6 text-gray-400" 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`btn btn-sm ${
                                    currentPage === 1 
                                        ? 'btn-disabled' 
                                        : 'btn-outline hover:btn-primary'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                ก่อนหน้า
                            </button>
                            
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`btn btn-sm ${
                                            currentPage === page
                                                ? 'btn-primary'
                                                : 'btn-outline hover:btn-primary'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`btn btn-sm ${
                                    currentPage === totalPages 
                                        ? 'btn-disabled' 
                                        : 'btn-outline hover:btn-primary'
                                }`}
                            >
                                ถัดไป
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                    
                    {/* Project Info */}
                    {projects.length > 0 && (
                        <div className="text-center mt-4 text-sm text-base-content/60">
                            แสดง {indexOfFirstProject + 1}-{Math.min(indexOfLastProject, projects.length)} จาก {projects.length} โครงการ
                        </div>
                    )}
                    
                    <div className="flex justify-center mt-8 gap-4">
                        <Button 
                            onClick={() => router.push('/userdashboard')}
                            variant="outline"
                        >
                            กลับไปแดชบอร์ด
                        </Button>
                        <Button 
                            onClick={() => router.push('/userdashboard')}
                            variant="outline"
                        >
                            สร้างโครงการใหม่
                        </Button>
                        
                    </div>
                </>
            )}
        </div>
    );

    // Render main menu
    const renderMainMenu = () => (
        <div className="container mx-auto max-w-6xl bg-base-100 p-8 rounded-xl shadow-xl flex-grow flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-center mb-8">เลือกประเภทเอกสาร</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* สัญญาจ้างทั่วไป Card */}
                <div
                    className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-primary"
                    onClick={() => handleCategorySelection('general')}
                >
                    <div className="card-body items-center text-center p-8">
                        <div className="flex items-center justify-center p-6 rounded-full bg-primary/10 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="card-title text-2xl mb-4">เอกสารสัญญาจ้างทั่วไป</h2>
                        <p className="text-lg text-base-content/60">สำหรับการจ้างงานทั่วไป</p>
                        <div className="mt-4">
                            <div className="badge badge-outline badge-lg">2 เอกสาร</div>
                        </div>
                    </div>
                </div>

                {/* ยื่นโครงการ Card */}
                <div
                    className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-primary"
                    onClick={() => handleCategorySelection('project')}
                >
                    <div className="card-body items-center text-center p-8">
                        <div className="flex items-center justify-center p-6 rounded-full bg-pink-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="card-title text-2xl mb-4">เอกสารยื่นโครงการ</h2>
                        <p className="text-lg text-base-content/60">สำหรับการยื่นโครงการ</p>
                        <div className="mt-4">
                            <div className="badge badge-outline badge-lg">3 เอกสาร</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Upload Option */}
            <div className="text-center mt-8">
                <p className="text-lg text-base-content/70">
                    หรือ 
                    <button 
                        onClick={() => {
                            if (selectedProjectId) {
                                localStorage.setItem('selectedProjectId', selectedProjectId);
                                router.push('/uploads-doc');
                            }
                        }}
                        className="text-primary hover:text-primary-focus underline cursor-pointer font-semibold transition-colors"
                    >
                        อัพโหลดเอกสาร
                    </button>
                </p>
            </div>
        </div>
    );

    // Render category submenu
    const renderCategorySubmenu = () => {
        if (selectedCategory === 'general') {
            return (
                <div className="container mx-auto max-w-6xl bg-base-100 p-8 rounded-xl shadow-xl flex-grow flex flex-col justify-center">
                    <h1 className="text-3xl font-bold text-center mb-2">สัญญาจ้างทั่วไป</h1>
                    <p className="text-center text-base-content/60 mb-8">เลือกเอกสารที่ต้องการสร้าง</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-primary"
                            onClick={() => handleApprovalSelection('approval-letter', 'หนังสือขออนุมัติของมูลนิธิ')}
                        >
                            <div className="card-body items-center text-center p-6">
                                <div className="flex items-center justify-center p-4 rounded-full bg-primary/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="card-title mt-4 text-xl">หนังสือขออนุมัติของมูลนิธิ</h3>
                                <p className="text-sm text-base-content/60">เอกสารขออนุมัติดำเนินโครงการจากมูลนิธิ</p>
                            </div>
                        </div>
                        
                        <div
                            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-primary"
                            onClick={() => handleTorSelection('tor-general', 'ขอบเขตของงาน (TOR)')}
                        >
                            <div className="card-body items-center text-center p-6">
                                <div className="flex items-center justify-center p-4 rounded-full bg-primary/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <h3 className="card-title mt-4 text-xl">ขอบเขตของงาน (TOR)</h3>
                                <p className="text-sm text-base-content/60">กำหนดขอบเขตและรายละเอียดของงาน</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else if (selectedCategory === 'project') {
            return (
                <div className="container mx-auto max-w-6xl bg-base-100 p-8 rounded-xl shadow-xl flex-grow flex flex-col justify-center">
                    <h1 className="text-3xl font-bold text-center mb-2">ยื่นโครงการ</h1>
                    <p className="text-center text-base-content/60 mb-8">เลือกเอกสารที่ต้องการสร้าง</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div
                            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-primary"
                            onClick={() => handleFormProjectSelection('project-proposal', 'ข้อเสนอโครงการ')}
                        >
                            <div className="card-body items-center text-center p-6">
                                <div className="flex items-center justify-center p-4 rounded-full bg-pink-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="card-title mt-4 text-xl">ข้อเสนอโครงการ</h3>
                                <p className="text-sm text-base-content/60">เอกสารเสนอโครงการและแผนงาน</p>
                            </div>
                        </div>
                        
                        <div
                            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-primary"
                            onClick={() => handleContractSelection('academic-contract', 'สัญญาจ้างปฎิบัติงานวิชาการ')}
                        >
                            <div className="card-body items-center text-center p-6">
                                <div className="flex items-center justify-center p-4 rounded-full bg-pink-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="card-title mt-4 text-xl">สัญญาจ้างปฎิบัติงานวิชาการ</h3>
                                <p className="text-sm text-base-content/60">สัญญาจ้างสำหรับงานวิชาการเฉพาะ</p>
                            </div>
                        </div>
                        
                        <div
                            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-primary"
                            onClick={() => handleTorSelection('tor-project', 'ขอบเขตของงาน (TOR)')}
                        >
                            <div className="card-body items-center text-center p-6">
                                <div className="flex items-center justify-center p-4 rounded-full bg-pink-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 className="card-title mt-4 text-xl">ขอบเขตของงาน (TOR)</h3>
                                <p className="text-sm text-base-content/60">กำหนดขอบเขตงานสำหรับโครงการ</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="max-w-6xl mx-auto min-h-screen bg-base-200 text-base-content p-6 flex flex-col">
            {/* Header and Back button */}
            <div className="navbar bg-base-100 rounded-box shadow-lg mb-6">
                <div className="flex-1">
                <Button
                        onClick={handleBack}
                        className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg transition-colors"
                    >
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
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        <span className="ml-2">กลับ</span>
                    </Button>
                </div>
                {selectedCategory && (
                    <div className="flex-none">
                        <div className="breadcrumbs text-sm">
                            <ul>
                                <li>
                                    <button 
                                        onClick={() => setSelectedCategory(null)}
                                        className="link link-hover"
                                    >
                                        หน้าหลัก
                                    </button>
                                </li>
                                <li className="text-base-content/60">
                                    {selectedCategory === 'general' ? 'สัญญาจ้างทั่วไป' : 'ยื่นโครงการ'}
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Conditional rendering based on selected category */}
            {selectedProjectId ? (
                selectedCategory ? renderCategorySubmenu() : renderMainMenu()
            ) : (
                renderProjectSelection()
            )}
        </div>
    );
}