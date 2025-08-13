"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, FormEvent } from "react";
// import { MdOutlineComputer, MdOutlineAnalytics, MdOutlineSettingsInputComponent } from "react-icons/md";

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
    const [selectedProject, setSelectedProject] = useState<ProjectTemplate | null>(null);
    const [formData, setFormData] = useState<TorsData | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            if (!prevData) return null;
            return {
                ...prevData,
                [name]: name === "budget" ? Number(value) : value,
            };
        });
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        
        if (!formData) return;

        // In a real application, you would send this data to your backend API.
        // For this example, we will simulate an API call with a timeout.
        try {
            console.log("Saving TORS data:", formData);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate a 2-second API call
            
            console.log("Data saved successfully!");
            
            // After saving, redirect to the dashboard
            router.push('/userdashboard');
        } catch (error) {
            console.error("Failed to save data:", error);
            setIsSaving(false);
        }
    };
    
    // Handle back button logic
    const handleBack = () => {
        if (selectedProject) {
            // If a project is selected, go back to the selection screen
            setSelectedProject(null);
            setFormData(null);
        } else {
            // If no project is selected, go back to the dashboard
            router.push('/userdashboard');
        }
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
                <h1 className="text-3xl font-bold text-center mb-8">
                    {selectedProject ? `สร้างเอกสาร TORS: ${selectedProject.title}` : "เลือกประเภทโครงการ"}
                </h1>
                
                {!selectedProject ? (
                    /* --- Project Selection Grid --- */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {projectTemplates.map((template) => (
                            <div
                                key={template.id}
                                className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-colors duration-200"
                                onClick={() => {
                                    setSelectedProject(template);
                                    setFormData(template.initialData);
                                }}
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
                ) : (
                    /* --- TORS Creation Form --- */
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Project Name */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-lg">ชื่อโครงการ</span>
                                </label>
                                <input
                                    type="text"
                                    name="projectName"
                                    placeholder="เช่น โครงการพัฒนาเว็บไซต์บริษัท"
                                    className="input input-bordered w-full text-lg"
                                    value={formData?.projectName || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            {/* Client Name */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-lg">ชื่อลูกค้า</span>
                                </label>
                                <input
                                    type="text"
                                    name="clientName"
                                    placeholder="เช่น บริษัท สยามเทค จำกัด"
                                    className="input input-bordered w-full text-lg"
                                    value={formData?.clientName || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Project Description */}
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text text-lg">รายละเอียดโครงการ</span>
                            </label>
                            <textarea
                                name="projectDescription"
                                placeholder="ระบุรายละเอียดโครงการโดยย่อ..."
                                className="textarea textarea-bordered h-32 w-full text-lg"
                                value={formData?.projectDescription || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        {/* Scope of Work */}
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text text-lg">ขอบเขตของงาน (Scope of Work)</span>
                            </label>
                            <textarea
                                name="scopeOfWork"
                                placeholder="ระบุขอบเขตของงานและ deliverables..."
                                className="textarea textarea-bordered h-40 w-full text-lg"
                                value={formData?.scopeOfWork || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Timeline and Budget Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-lg">วันเริ่มต้นโครงการ</span>
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    className="input input-bordered w-full text-lg"
                                    value={formData?.startDate || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-lg">วันสิ้นสุดโครงการ</span>
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    className="input input-bordered w-full text-lg"
                                    value={formData?.endDate || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-lg">งบประมาณ (บาท)</span>
                                </label>
                                <input
                                    type="number"
                                    name="budget"
                                    placeholder="เช่น 150000"
                                    className="input input-bordered w-full text-lg"
                                    value={formData?.budget || 0}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-lg">ผู้ประสานงาน</span>
                                </label>
                                <input
                                    type="text"
                                    name="contactPerson"
                                    placeholder="เช่น คุณสมชาย รักดี"
                                    className="input input-bordered w-full text-lg"
                                    value={formData?.contactPerson || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                            <button type="submit" className="btn btn-primary btn-lg w-full max-w-xs" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    'บันทึก'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}