import { auth } from "@/lib/server/auth/session";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/shared/constants";
import { type Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
    title: "ตั้งรหัสผ่านใหม่ - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ",
};

export default async function ResetPasswordPage() {
    const session = await auth();

    if (session) {
        redirect(ROUTES.DASHBOARD);
    }

    return <ResetPasswordClient />;
}
