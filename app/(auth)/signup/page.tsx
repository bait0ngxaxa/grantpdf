import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { type Metadata } from "next";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
    title: "ลงทะเบียน - ระบบสร้างและกรอกแบบฟอร์มอัตโนมัติ",
};

export default async function SignupPage() {
    const session = await auth();

    if (session) {
        redirect(ROUTES.DASHBOARD);
    }

    return <SignupClient />;
}
