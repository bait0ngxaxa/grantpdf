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
            className={`min-h-screen flex flex-col items-center bg-gradient-to-br ${gradientFrom} ${gradientTo} p-4 font-sans antialiased`}
        >
            <div className="bg-white rounded-2xl shadow-lg mb-6 w-full max-w-5xl p-4">
                <div className="flex items-center">
                    <Button
                        onClick={handleBack}
                        className="group flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-600 shadow-sm hover:shadow-md hover:border-slate-300 hover:text-slate-900 transition-all duration-300 rounded-full"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 transition-transform group-hover:-translate-x-1"
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
                        <span className="font-medium">ย้อนกลับ</span>
                    </Button>
                </div>
            </div>

            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div
                    className={`bg-gradient-to-r ${headerGradientFrom} ${headerGradientTo} p-6 text-white`}
                >
                    <h2 className="text-3xl font-bold text-center">{title}</h2>
                    {subtitle && (
                        <p className={`text-center mt-2 ${headerTextColor}`}>
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className="p-8">{children}</div>
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
