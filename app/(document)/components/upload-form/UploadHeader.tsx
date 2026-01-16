import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { ChevronLeft, UploadCloud, FileText } from "lucide-react";
import { ROUTES } from "@/lib/constants";

interface UploadHeaderProps {
    onBack?: () => void;
    title?: string;
    subtitle?: string;
}

export const UploadHeader = ({
    onBack,
}: UploadHeaderProps): React.JSX.Element => {
    const router = useRouter();

    const handleBack = (): void => {
        if (onBack) {
            onBack();
        } else {
            router.push(ROUTES.DASHBOARD);
        }
    };

    return (
        <div className="bg-white border-b border-gray-200">
            {/* Top decorative bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                            <UploadCloud className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                อัพโหลดเอกสาร
                                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                    Upload Documents
                                </span>
                            </h1>
                            <p className="text-gray-500 mt-1 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                อัพโหลดไฟล์เอกสาร .docx หรือ .pdf
                                เพื่อแนบในโครงการ
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Button
                            onClick={handleBack}
                            variant="ghost"
                            className="cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100 gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            กลับไปยังแดชบอร์ด
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
