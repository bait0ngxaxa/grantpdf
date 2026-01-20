"use client";

import { type ChangeEvent, forwardRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/app/(document)/components";
import { Image as ImageIcon, PenTool, Upload } from "lucide-react";

import type { SignatureCanvasRef } from "./SignatureCanvas";

// Dynamic import สำหรับ SignatureCanvas
const SignatureCanvasComponent = dynamic(() => import("./SignatureCanvas"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500">กำลังโหลดพื้นที่วาดลายเซ็น...</p>
        </div>
    ),
});

interface SignatureSectionProps {
    signaturePreview: string | null;
    signatureCanvasData: string | null;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onCanvasChange: (data: string | null) => void;
    signatureCanvasRef?: React.RefObject<SignatureCanvasRef | null>;
    uploadTitle?: string;
    canvasTitle?: string;
}

export const SignatureSection = forwardRef<
    HTMLDivElement,
    SignatureSectionProps
>(function SignatureSection(
    {
        signaturePreview,
        signatureCanvasData,
        onFileChange,
        onCanvasChange,
        signatureCanvasRef,
        uploadTitle = "อัปโหลดลายเซ็นผู้ขออนุมัติ",
        canvasTitle = "วาดลายเซ็นผู้ขออนุมัติ",
    },
    ref,
): React.JSX.Element {
    return (
        <div ref={ref}>
            {/* อัปโหลดลายเซ็น */}
            <FormSection
                title={uploadTitle}
                bgColor="bg-white dark:bg-slate-800"
                borderColor="border-yellow-200 dark:border-yellow-900/50"
                headerBorderColor="border-yellow-300 dark:border-yellow-800"
                icon={
                    <ImageIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                }
            >
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        อัปโหลดลายเซ็น (.png, .jpeg)
                    </label>
                    <Input
                        type="file"
                        name="signatureFile"
                        className={`border border-slate-300 dark:border-slate-600 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                transition-colors file:mr-4 file:py-2 file:px-4 
                                file:rounded-md file:border-0 file:text-sm 
                                file:font-medium file:bg-blue-50 dark:file:bg-blue-900/40 file:text-blue-700 dark:file:text-blue-300
                                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/60
                                text-slate-700 dark:text-slate-300`}
                        accept="image/png, image/jpeg"
                        onChange={onFileChange}
                    />
                    {signaturePreview && (
                        <div className="flex justify-center mt-4 p-4 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-600">
                            <Image
                                src={signaturePreview}
                                alt="Signature Preview"
                                width={320}
                                height={200}
                                className="max-w-xs h-auto object-contain border dark:border-slate-600 rounded-lg shadow-sm"
                            />
                        </div>
                    )}
                </div>
            </FormSection>

            {/* Divider */}
            <div className="relative my-8">
                <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                >
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
                </div>
                <div className="relative flex justify-center">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-3 rounded-full border-2 border-blue-200 dark:border-blue-800 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                <Upload className="w-5 h-5" />
                                <span className="text-sm font-medium">
                                    อัปโหลด
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                    หรือ
                                </span>
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                                    เลือกอย่างใดอย่างหนึ่ง
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <PenTool className="w-5 h-5" />
                                <span className="text-sm font-medium">
                                    วาดลายเซ็น
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        💡คุณสามารถอัปโหลดไฟล์ลายเซ็นที่มีอยู่แล้ว หรือ
                        วาดลายเซ็นใหม่บนหน้าจอได้
                    </p>
                </div>
            </div>

            {/* วาดลายเซ็นออนไลน์ */}
            <FormSection
                title={canvasTitle}
                bgColor="bg-indigo-50 dark:bg-indigo-900/20"
                borderColor="border-indigo-200 dark:border-indigo-900/50"
                headerBorderColor="border-indigo-300 dark:border-indigo-800"
                icon={
                    <PenTool className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                }
            >
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        วาดลายเซ็นของผู้ขออนุมัติ
                    </label>
                    <SignatureCanvasComponent
                        ref={signatureCanvasRef}
                        onSignatureChange={onCanvasChange}
                        canvasProps={{
                            width: 400,
                            height: 200,
                            backgroundColor: "rgba(255, 255, 255, 1)",
                            penColor: "black",
                        }}
                    />
                    {signatureCanvasData && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                ตัวอย่างลายเซ็นที่วาด:
                            </p>
                            <div className="flex justify-center p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <Image
                                    src={signatureCanvasData}
                                    alt="Canvas Signature Preview"
                                    width={320}
                                    height={200}
                                    className="max-w-xs h-auto object-contain border dark:border-slate-600 rounded-lg shadow-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </FormSection>
        </div>
    );
});
