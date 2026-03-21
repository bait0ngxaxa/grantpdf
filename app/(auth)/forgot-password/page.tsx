import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { type Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
    title: "ลืมรหัสผ่าน - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ",
};

export default async function ForgotPasswordPage() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect("/userdashboard");
    }

    return <ForgotPasswordClient />;
}
