import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Loading(): React.JSX.Element {
    return <LoadingSpinner className="min-h-screen" message="กำลังโหลดข้อมูล…" />;
}
