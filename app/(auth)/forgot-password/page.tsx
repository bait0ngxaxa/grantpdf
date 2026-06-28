import { auth } from "@/lib/server/auth/session";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/shared/constants";
import { type Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
    title: "ลืมรหัสผ่าน - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ",
};

export default async function ForgotPasswordPage() {
    const session = await auth();

    if (session) {
        redirect(ROUTES.DASHBOARD);
    }

    return <ForgotPasswordClient />;
}
