import { type Metadata } from "next";
import UploadDocClient from "./UploadDocClient";

export const metadata: Metadata = {
    title: "อัพโหลดเอกสาร | ระบบจัดการเอกสาร",
};

export default async function UploadDocPage() {
    return <UploadDocClient />;
}
