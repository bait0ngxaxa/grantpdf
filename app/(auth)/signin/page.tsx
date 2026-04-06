import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { type Metadata } from "next";
import SigninClient from "./SigninClient";

export const metadata: Metadata = {
    title: "เข้าสู่ระบบ - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ",
};

export default async function LoginPage() {
    const session = await auth();

    if (session) {
        redirect(ROUTES.DASHBOARD);
    }

    return <SigninClient />;
}
