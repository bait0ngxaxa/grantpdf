import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { type Metadata } from "next";
import UploadDocClient from "./UploadDocClient";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
    title: "อัพโหลดเอกสาร | ระบบจัดการเอกสาร",
};

export default async function UploadDocPage() {
    const session = await auth();

    if (!session) {
        redirect(ROUTES.SIGNIN);
    }

    return <UploadDocClient />;
}
