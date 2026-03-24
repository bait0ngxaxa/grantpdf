import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAdminDashboardStats } from "@/lib/services/adminService";
import { redirect } from "next/navigation";
import { AdminDashboardWrapper } from "./AdminDashboardWrapper";

export const metadata: Metadata = {
    title: "Admin Dashboard - ระบบจัดการเอกสาร",
    description: "Manage projects, documents, and users.",
};

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}): Promise<React.JSX.Element> {
    // P3: Prefetch admin stats on server to eliminate client-side waterfall
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
        redirect("/access-denied");
    }

    let initialStats: Awaited<ReturnType<typeof getAdminDashboardStats>> | undefined;
    try {
        initialStats = await getAdminDashboardStats();
    } catch (error) {
        console.error("Failed to prefetch admin dashboard stats:", error);
        initialStats = undefined;
    }

    return <AdminDashboardWrapper initialStats={initialStats}>{children}</AdminDashboardWrapper>;
}

