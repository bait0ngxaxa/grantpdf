import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

interface PageLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    backPath?: string;
    gradientFrom?: string;
    gradientTo?: string;
    headerGradientFrom?: string;
    headerGradientTo?: string;
    headerTextColor?: string;
    isDirty?: boolean;
    isExitModalOpen?: boolean;
    setIsExitModalOpen?: (open: boolean) => void;
    onConfirmExit?: () => void;
}

export function PageLayout({
    children,
    title,
    subtitle,
    backPath = "/createdocs",
    gradientFrom = "from-slate-50",
    gradientTo = "to-blue-50",
    headerGradientFrom = "from-blue-600",
    headerGradientTo = "to-purple-600",
    headerTextColor = "text-blue-100",
    isDirty = false,
    isExitModalOpen: externalIsExitModalOpen,
    setIsExitModalOpen: externalSetIsExitModalOpen,
    onConfirmExit,
}: PageLayoutProps) {
    const router = useRouter();
    const [internalIsExitModalOpen, setInternalIsExitModalOpen] =
        useState(false);

    // Use external state if provided, otherwise use internal
    const isExitModalOpen = externalIsExitModalOpen ?? internalIsExitModalOpen;
    const setIsExitModalOpen =
        externalSetIsExitModalOpen ?? setInternalIsExitModalOpen;

    const handleBack = () => {
        if (isDirty) {
            setIsExitModalOpen(true);
        } else {
            router.push(backPath);
        }
    };

    const confirmExit = () => {
        setIsExitModalOpen(false);
        if (onConfirmExit) {
            onConfirmExit();
        } else {
            router.push(backPath);
        }
    };

    return (
        <div
            className={`min-h-screen flex flex-col items-center bg-gradient-to-br ${gradientFrom} ${gradientTo} p-4 sm:p-6 lg:p-8 font-sans antialiased`}
        >
            <div className="w-full max-w-5xl mb-6">
                <Button
                    onClick={handleBack}
                    variant="ghost"
                    className="group bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200 text-slate-600 shadow-sm hover:shadow-md hover:border-slate-300 hover:text-slate-900 transition-all duration-300 rounded-2xl px-5 py-6"
                >
                    <div className="p-1 rounded-lg bg-slate-100 group-hover:bg-slate-50 border border-slate-200 group-hover:border-slate-300 transition-colors mr-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 transition-transform group-hover:-translate-x-0.5"
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
                    </div>
                    <span className="font-semibold text-base">ย้อนกลับ</span>
                </Button>
            </div>

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 overflow-hidden ring-1 ring-slate-900/5">
                <div
                    className={`bg-gradient-to-r ${headerGradientFrom} ${headerGradientTo} p-8 text-white relative overflow-hidden`}
                >
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight text-white drop-shadow-sm">
                            {title}
                        </h2>
                        {subtitle && (
                            <div className="flex justify-center mt-3">
                                <span
                                    className={`inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-sm font-medium tracking-wide ${headerTextColor}`}
                                >
                                    {subtitle}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-6 md:p-10 bg-slate-50/30">{children}</div>
            </div>

            <Dialog open={isExitModalOpen} onOpenChange={setIsExitModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ยืนยันการออกจากหน้านี้</DialogTitle>
                        <DialogDescription>
                            ข้อมูลที่คุณกรอกจะไม่ถูกบันทึก
                            คุณต้องการออกจากหน้านี้ใช่หรือไม่?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                            >
                                ยกเลิก
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={confirmExit}
                            className="cursor-pointer"
                        >
                            ยืนยัน
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
