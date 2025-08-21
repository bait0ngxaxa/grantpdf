"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // ✅ ฟังก์ชันสำหรับการ redirect ไป /create-word-doc
    const handleProjectSelection = (templateId: string, title: string) => {
        // เก็บข้อมูล template ใน localStorage เพื่อนำไปใช้ในหน้า create-word-doc
        const templateData = {
            id: templateId,
            title: title,
        };
        localStorage.setItem('selectedProjectTemplate', JSON.stringify(templateData));
        // redirect ไปหน้า create-word-doc
        router.push('/create-word-doc');
    };
    
    // Handle back button logic
    const handleBack = () => {
        if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            router.push('/userdashboard');
        }
    };

    // Handle category selection
    const handleCategorySelection = (category: string) => {
        setSelectedCategory(category);
    };

    // Render main menu
    const renderMainMenu = () => (
        <div className="container mx-auto max-w-4xl bg-base-100 p-8 rounded-xl shadow-xl flex-grow flex flex-col justify-center">
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
                        <h2 className="card-title text-2xl mb-4">สัญญาจ้างทั่วไป</h2>
                        <p className="text-lg text-base-content/60">เอกสารสำหรับการจ้างงานทั่วไป</p>
                        <div className="mt-4">
                            <div className="badge badge-outline badge-lg">2 เอกสาร</div>
                        </div>
                    </div>
                </div>

                {/* ยื่นโครงการ Card */}
                <div
                    className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-secondary"
                    onClick={() => handleCategorySelection('project')}
                >
                    <div className="card-body items-center text-center p-8">
                        <div className="flex items-center justify-center p-6 rounded-full bg-secondary/10 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="card-title text-2xl mb-4">ยื่นโครงการ</h2>
                        <p className="text-lg text-base-content/60">เอกสารสำหรับการยื่นโครงการ</p>
                        <div className="mt-4">
                            <div className="badge badge-outline badge-lg">3 เอกสาร</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render category submenu
    const renderCategorySubmenu = () => {
        if (selectedCategory === 'general') {
            return (
                <div className="container mx-auto max-w-4xl bg-base-100 p-8 rounded-xl shadow-xl flex-grow flex flex-col justify-center">
                    <h1 className="text-3xl font-bold text-center mb-2">สัญญาจ้างทั่วไป</h1>
                    <p className="text-center text-base-content/60 mb-8">เลือกเอกสารที่ต้องการสร้าง</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-primary"
                            onClick={() => handleProjectSelection('approval-letter', 'หนังสือขออนุมัติของมูลนิธิ')}
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
                            onClick={() => handleProjectSelection('tor-general', 'ขอบเขตของงาน (TOR)')}
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
                            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-secondary"
                            onClick={() => handleProjectSelection('project-proposal', 'ข้อเสนอโครงการ')}
                        >
                            <div className="card-body items-center text-center p-6">
                                <div className="flex items-center justify-center p-4 rounded-full bg-secondary/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="card-title mt-4 text-xl">ข้อเสนอโครงการ</h3>
                                <p className="text-sm text-base-content/60">เอกสารเสนอโครงการและแผนงาน</p>
                            </div>
                        </div>
                        
                        <div
                            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-secondary"
                            onClick={() => handleProjectSelection('academic-contract', 'สัญญาจ้างปฎิบัติงานวิชาการ')}
                        >
                            <div className="card-body items-center text-center p-6">
                                <div className="flex items-center justify-center p-4 rounded-full bg-secondary/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="card-title mt-4 text-xl">สัญญาจ้างปฎิบัติงานวิชาการ</h3>
                                <p className="text-sm text-base-content/60">สัญญาจ้างสำหรับงานวิชาการเฉพาะ</p>
                            </div>
                        </div>
                        
                        <div
                            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-secondary"
                            onClick={() => handleProjectSelection('tor-project', 'ขอบเขตของงาน (TOR)')}
                        >
                            <div className="card-body items-center text-center p-6">
                                <div className="flex items-center justify-center p-4 rounded-full bg-secondary/10">
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
        <div className="min-h-screen bg-base-200 text-base-content p-6 flex flex-col">
            {/* Header and Back button */}
            <div className="navbar bg-base-100 rounded-box shadow-lg mb-6">
                <div className="flex-1">
                    <Button onClick={handleBack} >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
            {selectedCategory ? renderCategorySubmenu() : renderMainMenu()}
        </div>
    );
}