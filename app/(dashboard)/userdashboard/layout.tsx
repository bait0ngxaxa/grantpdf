import type { Metadata } from "next";
import { DashboardWrapper } from "./DashboardWrapper";

export const metadata: Metadata = {
    title: "Dashboard - ระบบจัดการเอกสาร",
    description: "Manage your projects and documents efficiently.",
};

export default function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    return <DashboardWrapper>{children}</DashboardWrapper>;
}
