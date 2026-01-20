import type { Metadata } from "next";
import { CreateDocsWrapper } from "./CreateDocsWrapper";

export const metadata: Metadata = {
    title: "สร้างเอกสารใหม่ - ระบบจัดการเอกสาร",
    description: "Create new documents via wizard.",
};

export default function CreateDocsLayout({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    return <CreateDocsWrapper>{children}</CreateDocsWrapper>;
}
