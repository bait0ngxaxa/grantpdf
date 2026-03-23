import { type Metadata } from "next";
import AccessDeniedClient from "./AccessDeniedClient";

export const metadata: Metadata = {
    title: "Access Denied | ระบบจัดการเอกสาร",
};

export default function AccessDeniedPage() {
    return <AccessDeniedClient />;
}
