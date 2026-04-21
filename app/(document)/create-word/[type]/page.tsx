import type { ComponentType } from "react";
import { notFound } from "next/navigation";

const DOCUMENT_LABELS: Record<string, string> = {
    approval: "สร้างหนังสือขออนุมัติ",
    contract: "สร้างหนังสือสัญญา",
    formproject: "สร้างเอกสารเสนอโครงการ",
    summary: "สร้างรายงานสรุปผล",
    tor: "สร้าง TOR",
};

async function getDocumentForm(
    type: string,
): Promise<ComponentType | null> {
    switch (type) {
        case "approval":
            return (await import("@/app/(document)/components/forms/ApprovalForm"))
                .ApprovalForm;
        case "contract":
            return (await import("@/app/(document)/components/forms/ContractForm"))
                .ContractForm;
        case "formproject":
            return (
                await import("@/app/(document)/components/forms/FormProjectForm")
            ).FormProjectForm;
        case "summary":
            return (await import("@/app/(document)/components/forms/SummaryForm"))
                .SummaryForm;
        case "tor":
            return (await import("@/app/(document)/components/forms/TorForm"))
                .TorForm;
        default:
            return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ type: string }>;
}) {
    const { type } = await params;
    const label = DOCUMENT_LABELS[type];

    return {
        title: `${label ?? "สร้างเอกสาร"} | ระบบจัดการเอกสาร`,
    };
}

export default async function CreateDocumentPage({
    params,
}: {
    params: Promise<{ type: string }>;
}) {
    const { type } = await params;
    const Form = await getDocumentForm(type);

    if (!Form) {
        notFound();
    }

    return <Form />;
}
