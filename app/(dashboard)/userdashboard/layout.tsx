import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUserProjectStats } from "@/lib/services";
import { redirect } from "next/navigation";
import { DashboardWrapper } from "./DashboardWrapper";
import { ROUTES } from "@/lib/constants";
import { AuthRefreshProvider, SWRProvider } from "@/components/providers";

export const metadata: Metadata = {
    title: "Dashboard - ระบบจัดการเอกสาร",
    description: "Manage your projects and documents efficiently.",
};

export default async function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}): Promise<React.JSX.Element> {
    // P3: Prefetch stats on server to eliminate client-side waterfall
    const session = await auth();
    if (!session) {
        redirect(ROUTES.SIGNIN);
    }

    const userId = session.user?.id ? Number(session.user.id) : null;
    let initialStats: Awaited<ReturnType<typeof getUserProjectStats>> | undefined;

    if (userId) {
        try {
            initialStats = await getUserProjectStats(userId);
        } catch (error) {
            console.error("Failed to prefetch user dashboard stats:", error);
            initialStats = undefined;
        }
    }

    return (
        <SWRProvider>
            <AuthRefreshProvider shouldRefresh={true} />
            <DashboardWrapper initialStats={initialStats} session={session}>
                {children}
            </DashboardWrapper>
        </SWRProvider>
    );
}
