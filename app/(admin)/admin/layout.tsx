import type { Metadata } from "next";
import { AdminDashboardWrapper } from "./AdminDashboardWrapper";

export const metadata: Metadata = {
    title: "Admin Dashboard - ระบบจัดการเอกสาร",
    description: "Manage projects, documents, and users.",
};

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    return <AdminDashboardWrapper>{children}</AdminDashboardWrapper>;
}
