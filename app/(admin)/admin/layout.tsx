import type { Metadata } from "next";
import { auth } from "@/lib/server/auth/session";
import { getAdminDashboardStats } from "@/lib/services/adminService";
import { redirect } from "next/navigation";
import { AdminDashboardWrapper } from "./AdminDashboardWrapper";
import { isAdmin } from "@/lib/server/auth/guards";
import { ROUTES } from "@/lib/shared/constants";
import { AuthRefreshProvider, SWRProvider } from "@/components/providers";

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
    if (!session?.user?.id) {
        redirect(
            `${ROUTES.SIGNIN}?callbackUrl=${encodeURIComponent(
                ROUTES.ADMIN,
            )}&reason=session-expired`,
        );
    }

    if (!isAdmin(session)) {
        redirect(ROUTES.ACCESS_DENIED);
    }

    let initialStats: Awaited<ReturnType<typeof getAdminDashboardStats>> | undefined;
    try {
        initialStats = await getAdminDashboardStats();
    } catch (error) {
        console.error("Failed to prefetch admin dashboard stats:", error);
        initialStats = undefined;
    }

    return (
        <SWRProvider>
            <AuthRefreshProvider shouldRefresh={true} />
            <AdminDashboardWrapper initialStats={initialStats} session={session}>
                {children}
            </AdminDashboardWrapper>
        </SWRProvider>
    );
}
