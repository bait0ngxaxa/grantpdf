import { type ReactNode } from "react";
import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGlobalModal } from "@/lib/hooks/useGlobalModal";

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
    onConfirmExit?: () => void;
}

export function PageLayout({
    children,
    title,
    subtitle,
    backPath = "/createdocs",
    gradientFrom = "from-slate-50 dark:from-slate-900",
    gradientTo = "to-blue-50 dark:to-slate-800",
    headerGradientFrom = "from-blue-600 dark:from-blue-800",
    headerGradientTo = "to-purple-600 dark:to-purple-800",
    headerTextColor = "text-blue-100",
    isDirty = false,
    onConfirmExit,
}: PageLayoutProps): React.JSX.Element {
    const router = useRouter();
    const { showConfirm } = useGlobalModal();

    const handleBack = (): void => {
        if (isDirty) {
            showConfirm({
                title: "ยืนยันการออกจากหน้านี้",
                description:
                    "ข้อมูลที่คุณกรอกจะไม่ถูกบันทึก คุณต้องการออกจากหน้านี้ใช่หรือไม่?",
                confirmText: "ยืนยัน",
                cancelText: "ยกเลิก",
                isDestructive: true,
                onConfirm: () => {
                    if (onConfirmExit) {
                        onConfirmExit();
                    } else {
                        router.push(backPath);
                    }
                },
            });
        } else {
            router.push(backPath);
        }
    };

    // confirmExit function is no longer needed as wrapper, logic is inside showConfirm callback

    return (
        <div
            className={`min-h-screen flex flex-col items-center bg-gradient-to-br ${gradientFrom} ${gradientTo} p-4 sm:p-6 lg:p-8 font-sans antialiased`}
        >
            <div className="w-full max-w-5xl mb-6">
                <Button
                    onClick={handleBack}
                    variant="ghost"
                    className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300 rounded-2xl px-5 py-6"
                >
                    <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-50 dark:group-hover:bg-slate-600 border border-slate-200 dark:border-slate-600 group-hover:border-slate-300 dark:group-hover:border-slate-500 transition-colors mr-3">
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    <span className="font-semibold text-base">ย้อนกลับ</span>
                </Button>
            </div>

            <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-white/50 dark:border-slate-700 overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
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
                <div className="p-6 md:p-10 bg-slate-50/30 dark:bg-slate-900/30">
                    {children}
                </div>
            </div>
        </div>
    );
}
