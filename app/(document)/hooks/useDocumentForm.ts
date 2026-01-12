"use client";

import {
    useState,
    ChangeEvent,
    FormEvent,
    useCallback,
    useEffect,
} from "react";
import { useSession } from "next-auth/react";

interface UseDocumentFormOptions<T> {
    initialData: T;

    apiEndpoint: string;

    documentType: string;

    projectId?: string;

    prepareFormData?: (data: T, formData: FormData) => void;

    onSuccess?: (result: unknown) => void;
}

interface UseDocumentFormReturn<T> {
    // State
    formData: T;
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    isSubmitting: boolean;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    message: string | null;
    isError: boolean;
    isSuccessModalOpen: boolean;
    setIsSuccessModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    generatedFileUrl: string | null;
    setGeneratedFileUrl: React.Dispatch<React.SetStateAction<string | null>>;
    isClient: boolean;

    // Handlers
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
    isDirty: boolean;

    // Utilities
    resetForm: () => void;
    setMessage: React.Dispatch<React.SetStateAction<string | null>>;
    setIsError: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useDocumentForm<T extends object>({
    initialData,
    apiEndpoint,
    documentType,
    projectId,
    prepareFormData,
    onSuccess,
}: UseDocumentFormOptions<T>): UseDocumentFormReturn<T> {
    const { data: session } = useSession();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [formData, setFormData] = useState<T>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(
        null
    );

    // Generic change handler
    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        },
        []
    );

    // Check if form has been modified
    const isDirty = Object.values(formData).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string") return value !== "";
        return value !== null && value !== undefined;
    });

    // Reset form to initial state
    const resetForm = useCallback(() => {
        setFormData(initialData);
        setMessage(null);
        setIsError(false);
        setGeneratedFileUrl(null);
    }, [initialData]);

    // Generic submit handler
    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            if (!session) {
                setMessage("คุณต้องเข้าสู่ระบบก่อน");
                setIsError(true);
                return;
            }

            setIsSubmitting(true);
            setMessage(null);
            setGeneratedFileUrl(null);
            setIsError(false);

            try {
                const data = new FormData();

                Object.entries(formData).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        data.append(key, JSON.stringify(value));
                    } else if (value !== null && value !== undefined) {
                        data.append(key, String(value));
                    }
                });

                if (session.user?.id) {
                    data.append("userId", session.user.id.toString());
                }
                if (session.user?.email) {
                    data.append("userEmail", session.user.email);
                }

                // Use projectId from URL params (passed as option)
                if (projectId) {
                    data.append("projectId", projectId);
                }

                // Add access token if available
                if ((session as { accessToken?: string })?.accessToken) {
                    data.append(
                        "token",
                        (session as { accessToken?: string }).accessToken!
                    );
                }

                if (prepareFormData) {
                    prepareFormData(formData, data);
                }

                const response = await fetch(apiEndpoint, {
                    method: "POST",
                    body: data,
                });

                if (response.ok) {
                    const contentType = response.headers.get("content-type");

                    if (
                        contentType &&
                        contentType.includes("application/json")
                    ) {
                        const result = await response.json();
                        // รองรับทั้ง storagePath (ใหม่) และ downloadUrl (legacy)
                        const fileUrl =
                            result.storagePath || result.downloadUrl;
                        if (result.success && fileUrl) {
                            setGeneratedFileUrl(fileUrl);
                            setMessage(
                                `สร้างเอกสาร ${documentType} สำเร็จแล้ว!${
                                    result.project?.name
                                        ? ` โครงการ: ${result.project.name}`
                                        : ""
                                }`
                            );
                            setIsError(false);
                            setIsSuccessModalOpen(true);
                            if (onSuccess) onSuccess(result);
                        } else if (fileUrl) {
                            const fullUrl = window.location.origin + fileUrl;
                            setGeneratedFileUrl(fullUrl);
                            setMessage(
                                `สร้างเอกสาร ${documentType} สำเร็จแล้ว!`
                            );
                            setIsError(false);
                            setIsSuccessModalOpen(true);
                            if (onSuccess) onSuccess(result);
                        } else {
                            setMessage(
                                `ไม่สามารถสร้างเอกสาร ${documentType} ได้`
                            );
                            setIsError(true);
                        }
                    } else {
                        // Handle blob response
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        setGeneratedFileUrl(url);
                        setMessage(`สร้างเอกสาร ${documentType} สำเร็จแล้ว!`);
                        setIsError(false);
                        setIsSuccessModalOpen(true);
                    }
                } else {
                    const errorText = await response.text();
                    setMessage(
                        `เกิดข้อผิดพลาด: ${
                            errorText ||
                            `ไม่สามารถสร้างเอกสาร ${documentType} ได้`
                        }`
                    );
                    setIsError(true);
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
                setIsError(true);
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            session,
            formData,
            apiEndpoint,
            documentType,
            projectId,
            prepareFormData,
            onSuccess,
        ]
    );

    return {
        // State
        formData,
        setFormData,
        isSubmitting,
        setIsSubmitting,
        message,
        isError,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        generatedFileUrl,
        setGeneratedFileUrl,
        isClient,

        // Handlers
        handleChange,
        handleSubmit,
        isDirty,

        // Utilities
        resetForm,
        setMessage,
        setIsError,
    };
}
