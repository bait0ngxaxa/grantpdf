"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

// Mockup data for different project templates
const projectTemplates: ProjectTemplate[] = [
    {
        id: "web-dev",
        title: "โครงการพัฒนาเว็บไซต์",
        description: "สำหรับโครงการสร้างและพัฒนาเว็บไซต์ใหม่ทั้งหมด",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20h4a2 2 0 002-2v-3.586a1 1 0 00-.293-.707l-5.414-5.414a1 1 0 00-1.414 0L7.293 13.707a1 1 0 00-.293.707V18a2 2 0 002 2z" />
            </svg>
        ),
        initialData: {
            projectName: "โครงการพัฒนาเว็บไซต์",
            clientName: "",
            projectDescription: "โครงการพัฒนาเว็บไซต์ที่มีความทันสมัยและตอบสนองต่อผู้ใช้งาน",
            scopeOfWork: "ขอบเขตงาน: ออกแบบ UX/UI, พัฒนา Frontend, พัฒนา Backend, ทดสอบระบบ, ส่งมอบและอบรม",
            startDate: "",
            endDate: "",
            budget: 0,
            contactPerson: "",
        },
    },
    {
        id: "marketing",
        title: "โครงการการตลาดดิจิทัล",
        description: "สำหรับโครงการวางแผนและดำเนินงานด้านการตลาดออนไลน์",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        initialData: {
            projectName: "แคมเปญการตลาดดิจิทัล",
            clientName: "",
            projectDescription: "โครงการเพื่อเพิ่มการรับรู้แบรนด์และยอดขายผ่านช่องทางออนไลน์",
            scopeOfWork: "ขอบเขตงาน: วางแผนกลยุทธ์, สร้างคอนเทนต์, บริหารจัดการโซเชียลมีเดีย, วิเคราะห์ผลลัพธ์",
            startDate: "",
            endDate: "",
            budget: 0,
            contactPerson: "",
        },
    },
    {
        id: "consulting",
        title: "โครงการที่ปรึกษาทางธุรกิจ",
        description: "สำหรับบริการให้คำปรึกษาและวางแผนเชิงกลยุทธ์",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.186 0-6.324-.46-9-1.745M16 19.5v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1m.5-16.5l.5-1m.5 1l-.5 1m0-1l.5 1m-.5-1l.5 1" />
            </svg>
        ),
        initialData: {
            projectName: "โครงการที่ปรึกษาการวางแผนธุรกิจ",
            clientName: "",
            projectDescription: "บริการให้คำปรึกษาด้านการปรับปรุงกระบวนการและเพิ่มประสิทธิภาพการทำงาน",
            scopeOfWork: "ขอบเขตงาน: วิเคราะห์สถานการณ์ปัจจุบัน, เสนอแนวทางแก้ไข, จัดทำแผนงาน, สนับสนุนการนำไปใช้",
            startDate: "",
            endDate: "",
            budget: 0,
            contactPerson: "",
        },
    },
];

export default function CreateTorsPage() {
    const router = useRouter();

    // ✅ ฟังก์ชันสำหรับการ redirect ไป /create-word-doc
    const handleProjectSelection = (template: ProjectTemplate) => {
        // เก็บข้อมูล template ใน localStorage เพื่อนำไปใช้ในหน้า create-word-doc
        localStorage.setItem('selectedProjectTemplate', JSON.stringify(template));
        // redirect ไปหน้า create-word-doc
        router.push('/create-word-doc');
    };
    
    // Handle back button logic
    const handleBack = () => {
        router.push('/userdashboard');
    };

    return (
        <div className="min-h-screen bg-base-200 text-base-content p-6 flex flex-col">
            {/* Header and Back button */}
            <div className="navbar bg-base-100 rounded-box shadow-lg mb-6">
                <div className="flex-1">
                    <button onClick={handleBack} className="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="ml-2">กลับ</span>
                    </button>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl bg-base-100 p-8 rounded-xl shadow-xl flex-grow flex flex-col justify-center">
                <h1 className="text-3xl font-bold text-center mb-8">เลือกประเภทโครงการ</h1>
                
                {/* --- Project Selection Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {projectTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-colors duration-200"
                            onClick={() => handleProjectSelection(template)}
                        >
                            <div className="card-body items-center text-center">
                                <div className="flex items-center justify-center p-4 rounded-full bg-base-200 text-5xl">
                                    {template.icon}
                                </div>
                                <h2 className="card-title mt-4">{template.title}</h2>
                                <p className="text-sm text-gray-500">{template.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}