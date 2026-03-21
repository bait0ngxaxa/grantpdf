import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { type Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
    title: "ตั้งรหัสผ่านใหม่ - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ",
};

export default async function ResetPasswordPage() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect("/userdashboard");
    }

    return <ResetPasswordClient />;
}
