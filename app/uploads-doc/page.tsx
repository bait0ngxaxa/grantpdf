"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";

interface Project {
    id: string;
    name: string;
    description?: string;
    created_at: string;
}

export default function UploadDocPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);
    
    // เพิ่ม state สำหรับการจัดการโครงการ
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [projectError, setProjectError] = useState<string | null>(null);
    
    useTitle("อัพโหลดเอกสาร | ระบบจัดการเอกสาร");

    // โหลดรายการโครงการ
    useEffect(() => {
        const fetchProjects = async () => {
            if (!session) return;
            
            try {
                setIsLoadingProjects(true);
                setProjectError(null);
                
                const response = await fetch('/api/projects');
                if (!response.ok) {
                    throw new Error('ไม่สามารถโหลดรายการโครงการได้');
                }
                
                const data = await response.json();
                setProjects(data.projects || []);
                
                // ตรวจสอบ projectId ที่เก็บไว้ใน localStorage
                const storedProjectId = localStorage.getItem('selectedProjectId');
                if (storedProjectId && data.projects?.some((p: Project) => p.id === storedProjectId)) {
                    setSelectedProjectId(storedProjectId);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
                setProjectError('เกิดข้อผิดพลาดในการโหลดรายการโครงการ');
            } finally {
                setIsLoadingProjects(false);
            }
        };

        if (session) {
            fetchProjects();
        }
    }, [session]);

    // Redirect to signin if not authenticated
    if (status === "loading") {
        return <div className="flex justify-center items-center min-h-screen">กำลังโหลด...</div>;
    }

    if (!session) {
        router.push("/signin");
        return null;
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            
            if (!file.name.toLowerCase().endsWith('.docx') && !file.name.toLowerCase().endsWith('.pdf')) {
                setUploadMessage("กรุณาเลือกไฟล์ .docx และ .pdf เท่านั้น");
                setUploadSuccess(false);
                return;
            }

            // ตรวจสอบขนาดไฟล์ (10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                setUploadMessage("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)");
                setUploadSuccess(false);
                return;
            }

            setSelectedFile(file);
            setUploadMessage("");
            setUploadSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadMessage("กรุณาเลือกไฟล์ก่อน");
            setUploadSuccess(false);
            return;
        }
        
        if (!selectedProjectId) {
            setUploadMessage("กรุณาเลือกโครงการก่อน");
            setUploadSuccess(false);
            return;
        }

        setIsUploading(true);
        setUploadMessage("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("projectId", selectedProjectId);

            const response = await fetch("/api/file-upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setUploadMessage(`อัพโหลดไฟล์ "${selectedFile.name}" สำเร็จ!`);
                setUploadSuccess(true);
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                
            } else {
                setUploadMessage(result.error || "เกิดข้อผิดพลาดในการอัพโหลด");
                setUploadSuccess(false);
            }
        } catch (error) {
            console.error("Upload error:", error);
            setUploadMessage("เกิดข้อผิดพลาดในการอัพโหลด");
            setUploadSuccess(false);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.pdf')) {
                setSelectedFile(file);
                setUploadMessage("");
                setUploadSuccess(false);
            } else {
                setUploadMessage("กรุณาเลือกไฟล์ .docx และ .pdf เท่านั้น");
                setUploadSuccess(false);
            }
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">อัพโหลดเอกสาร</h1>
                            <p className="text-gray-600">อัพโหลดไฟล์เอกสาร ไฟล์แนบเพิ่มเติม</p>
                        </div>
                        <Button
                            onClick={() => router.push("/userdashboard")}
                            className="cursor-pointer"
                        >
                            กลับไปยัง Dashboard
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-8">
                    {/* Project Selection */}
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">เลือกโครงการ</h3>
                        
                        {isLoadingProjects ? (
                            <div className="flex justify-center py-4">
                                <div className="text-gray-500">กำลังโหลดโครงการ...</div>
                            </div>
                        ) : projectError ? (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-800 text-sm">{projectError}</p>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-yellow-800 text-sm">ไม่พบโครงการ กรุณาสร้างโครงการก่อน</p>
                                <Button 
                                    onClick={() => router.push("/createproject")}
                                    className="mt-2 cursor-pointer"
                                    size="sm"
                                >
                                    สร้างโครงการใหม่
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className={`card bg-base-100 shadow-md cursor-pointer transition-all duration-200 border-2 ${
                                            selectedProjectId === project.id
                                                ? "border-primary bg-primary/5 shadow-lg"
                                                : "border-gray-200 hover:border-primary hover:shadow-lg"
                                        }`}
                                        onClick={() => {
                                            setSelectedProjectId(project.id);
                                            localStorage.setItem('selectedProjectId', project.id);
                                        }}
                                    >
                                        <div className="card-body p-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 flex-shrink-0">
                                                    <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold mb-2 line-clamp-1">{project.name}</h3>
                                                    {project.description && (
                                                        <p className="text-sm text-base-content/60 mb-3 line-clamp-2 overflow-hidden text-ellipsis break-words">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center text-xs text-base-content/50">
                                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        สร้างเมื่อ: {new Date(project.created_at).toLocaleDateString('th-TH')}
                                                    </div>
                                                </div>
                                                {selectedProjectId === project.id && (
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {projects.length > 0 && (
                            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                                <span>เลือกโครงการที่ต้องการอัพโหลดไฟล์เข้าไป</span>
                                <Button
                                    onClick={() => router.push("/createproject")}
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                >
                                    สร้างโครงการใหม่
                                </Button>
                            </div>
                        )}
                    </div>
                    {/* Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            selectedFile
                                ? "border-green-300 bg-green-50"
                                : "border-gray-300 hover:border-gray-400"
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {selectedFile ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        ไฟล์ที่เลือก
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ขนาด: {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 13l3-3m0 0l3 3m-3-3v12"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        ลากไฟล์มาวางที่นี่
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        หรือคลิกเพื่อเลือกไฟล์
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        รองรับไฟล์ .docx และ .pdf (สูงสุด 10MB)
                                    </p>
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".docx,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isUploading}
                        />

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="mt-4 cursor-pointer"
                            disabled={isUploading}
                        >
                            เลือกไฟล์
                        </Button>
                    </div>

                    {/* Upload Button */}
                    {selectedFile && selectedProjectId && (
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="px-8 py-2 cursor-pointer"
                                
                            >
                                {isUploading ? "กำลังอัพโหลด..." : "อัพโหลดไฟล์"}
                            </Button>
                        </div>
                    )}
                    
                    {/* Status Message for Missing Requirements */}
                    {(selectedFile && !selectedProjectId) && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-800 text-sm text-center">
                                กรุณาเลือกโครงการก่อนอัพโหลดไฟล์
                            </p>
                        </div>
                    )}

                    {/* Upload Message */}
                    {uploadMessage && (
                        <div className="mt-6">
                            <div
                                className={`p-4 rounded-md ${
                                    uploadSuccess
                                        ? "bg-green-50 border border-green-200 text-green-800"
                                        : "bg-red-50 border border-red-200 text-red-800"
                                }`}
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        {uploadSuccess ? (
                                            <svg
                                                className="h-5 w-5 text-green-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-5 w-5 text-red-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium">{uploadMessage}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="mt-8 bg-blue-50 rounded-lg p-6">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">
                            คำแนะนำการใช้งาน:
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• เลือกโครงการที่ต้องการอัพโหลดไฟล์เข้าไป</li>
                            <li>• รองรับไฟล์ .docx และ .pdf</li>
                            <li>• ขนาดไฟล์สูงสุด 10MB</li>
                            <li>• สามารถลากไฟล์มาวางในพื้นที่อัพโหลด</li>
                            <li>• ไฟล์ที่อัพโหลดจะถูกเชื่อมโยงกับโครงการที่เลือก</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
