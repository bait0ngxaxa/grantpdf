"use client";

import { type ChangeEvent, forwardRef, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/app/(document)/components/FormSection";
import { Image as ImageIcon, PenTool, Trash2, Upload } from "lucide-react";

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
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <button
                        type="button"
                        onClick={selectUploadMode}
                        className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                            activeMode === "upload"
                                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/30 dark:text-blue-300"
                                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-blue-950/20"
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
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300"
                                : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-indigo-950/20"
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
                    <div className="space-y-4">
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                            <div className="mb-3 flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:ring-yellow-900/60">
                                    <ImageIcon className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        เลือกไฟล์ลายเซ็น
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                        รองรับไฟล์ PNG หรือ JPEG
                                    </p>
                                </div>
                            </div>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            name="signatureFile"
                            className="cursor-pointer rounded-lg border-slate-200 bg-white text-slate-700 transition-colors file:mr-4 file:rounded-md file:border-0 file:bg-yellow-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-yellow-800 hover:file:bg-yellow-100 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:file:bg-yellow-950/50 dark:file:text-yellow-300 dark:hover:file:bg-yellow-950"
                            accept="image/png, image/jpeg"
                            onChange={onFileChange}
                        />
                        </div>
                        {signaturePreview && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        ตัวอย่างลายเซ็น
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClearSignatureFile}
                                        className="h-9 cursor-pointer rounded-lg px-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                    >
                                        <Trash2 className="size-4" />
                                        ลบ
                                    </Button>
                                </div>
                                <div className="flex justify-center rounded-lg border border-dashed border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                    <Image
                                        src={signaturePreview}
                                        alt="Signature Preview"
                                        width={320}
                                        height={200}
                                        className="h-auto max-w-xs rounded-lg border object-contain shadow-sm dark:border-slate-600"
                                    />
                                </div>
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
                    <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                            <div className="mb-3 flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60">
                                    <PenTool className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        วาดลายเซ็นของผู้ขออนุมัติ
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                        ใช้นิ้ว เมาส์ หรือปากกา stylus ในพื้นที่ด้านล่าง
                                    </p>
                                </div>
                            </div>
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
                        </div>
                        {signatureCanvasData && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        ตัวอย่างลายเซ็นที่วาด
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClearSignatureCanvas}
                                        className="h-9 cursor-pointer rounded-lg px-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                    >
                                        <Trash2 className="size-4" />
                                        ลบ
                                    </Button>
                                </div>
                                <div className="flex justify-center rounded-lg border border-dashed border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                    <Image
                                        src={signatureCanvasData}
                                        alt="Canvas Signature Preview"
                                        width={320}
                                        height={200}
                                        className="h-auto max-w-xs rounded-lg border object-contain shadow-sm dark:border-slate-600"
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
