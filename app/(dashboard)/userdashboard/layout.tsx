import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUserProjectStats } from "@/lib/services";
import { redirect } from "next/navigation";
import { DashboardWrapper } from "./DashboardWrapper";

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
        redirect("/signin");
    }

    const userId = session?.user?.id ? Number(session.user.id) : null;
    const initialStats = userId ? await getUserProjectStats(userId) : undefined;

    return <DashboardWrapper initialStats={initialStats}>{children}</DashboardWrapper>;
}
