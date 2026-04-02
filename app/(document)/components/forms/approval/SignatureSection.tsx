"use client";

import { type ChangeEvent, forwardRef, useRef, useState } from "react";
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
            <p className="text-gray-500">กำลังโหลดพื้นที่วาดลายเซ็น…</p>
        </div>
    ),
});

interface SignatureSectionProps {
    signaturePreview: string | null;
    signatureCanvasData: string | null;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onCanvasChange: (data: string | null) => void;
    onClearSignatureFile: () => void;
    onClearSignatureCanvas: () => void;
    signatureCanvasRef?: React.RefObject<SignatureCanvasRef | null>;
    uploadTitle?: string;
    canvasTitle?: string;
}

type SignatureMode = "upload" | "draw";

export const SignatureSection = forwardRef<
    HTMLDivElement,
    SignatureSectionProps
>(function SignatureSection(
    {
        signaturePreview,
        signatureCanvasData,
        onFileChange,
        onCanvasChange,
        onClearSignatureFile,
        onClearSignatureCanvas,
        signatureCanvasRef,
        uploadTitle = "อัปโหลดลายเซ็นผู้ขออนุมัติ",
        canvasTitle = "วาดลายเซ็นผู้ขออนุมัติ",
    },
    ref,
): React.JSX.Element {
    const [signatureMode, setSignatureMode] = useState<SignatureMode>("upload");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeMode: SignatureMode = signatureCanvasData
        ? "draw"
        : signaturePreview
          ? "upload"
          : signatureMode;

    const selectUploadMode = (): void => {
        setSignatureMode("upload");
        onCanvasChange(null);
        onClearSignatureCanvas();
        signatureCanvasRef?.current?.clear();
    };

    const selectDrawMode = (): void => {
        setSignatureMode("draw");
        onClearSignatureFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div ref={ref}>
            <FormSection
                title="รูปแบบลายเซ็น"
                bgColor="bg-white dark:bg-slate-800"
                borderColor="border-blue-200 dark:border-blue-900/50"
                headerBorderColor="border-blue-300 dark:border-blue-800"
                icon={<PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={selectUploadMode}
                        className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                            activeMode === "upload"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300"
                        }`}
                    >
                        <span className="flex items-center gap-2 font-semibold text-sm">
                            <Upload className="w-4 h-4" />
                            อัปโหลดลายเซ็น
                        </span>
                        <p className="text-xs mt-1 opacity-80">
                            ใช้ไฟล์ที่เตรียมไว้ (.png, .jpeg)
                        </p>
                    </button>
                    <button
                        type="button"
                        onClick={selectDrawMode}
                        className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                            activeMode === "draw"
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300"
                        }`}
                    >
                        <span className="flex items-center gap-2 font-semibold text-sm">
                            <PenTool className="w-4 h-4" />
                            วาดลายเซ็น
                        </span>
                        <p className="text-xs mt-1 opacity-80">
                            วาดลายเซ็นบนหน้าจอทันที
                        </p>
                    </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                    เลือกได้เพียง 1 วิธี ระบบจะเคลียร์อีกวิธีให้อัตโนมัติ
                </p>
            </FormSection>

            {activeMode === "upload" ? (
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
                            ref={fileInputRef}
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
            ) : (
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
            )}
        </div>
    );
});
