import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { type Metadata } from "next";
import SigninClient from "./SigninClient";

export const metadata: Metadata = {
    title: "เข้าสู่ระบบ - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ",
};

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect("/userdashboard");
    }

    return <SigninClient />;
}
