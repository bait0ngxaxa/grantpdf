import { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

interface Project {
    id: string;
    name: string;
    description?: string;
    created_at: string;
}

export function useUploadDoc() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const [projects, setProjects] = useState<Project[]>([]);
    // Initialize from URL params if available
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        searchParams.get("projectId")
    );
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [projectError, setProjectError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!session) return;

            try {
                setIsLoadingProjects(true);
                setProjectError(null);

                const response = await fetch("/api/projects");
                if (!response.ok) {
                    throw new Error("ไม่สามารถโหลดรายการโครงการได้");
                }

                const data = await response.json();
                setProjects(data.projects || []);
            } catch (error) {
                console.error("Error fetching projects:", error);
                setProjectError("เกิดข้อผิดพลาดในการโหลดรายการโครงการ");
            } finally {
                setIsLoadingProjects(false);
            }
        };

        if (session) {
            fetchProjects();
        }
    }, [session]);

    const validateFile = (file: File): boolean => {
        if (
            !file.name.toLowerCase().endsWith(".docx") &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            setUploadMessage("กรุณาเลือกไฟล์ .docx และ .pdf เท่านั้น");
            setUploadSuccess(false);
            return false;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setUploadMessage("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)");
            setUploadSuccess(false);
            return false;
        }

        return true;
    };

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            setUploadMessage("");
            setUploadSuccess(false);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
                setUploadMessage("");
                setUploadSuccess(false);
            }
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

    return {
        session,
        status,
        fileInputRef,
        selectedFile,
        isUploading,
        uploadMessage,
        uploadSuccess,
        projects,
        selectedProjectId,
        setSelectedProjectId,
        isLoadingProjects,
        projectError,
        handleFileSelect,
        handleDragOver,
        handleDrop,
        handleUpload,
        router,
        setSelectedFile, // Exported for clearing file if needed
    };
}
