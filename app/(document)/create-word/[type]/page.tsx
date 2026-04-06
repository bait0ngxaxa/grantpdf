import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import {
    ApprovalForm,
    ContractForm,
    FormProjectForm,
    SummaryForm,
    TorForm,
} from "@/app/(document)/components";

const DOCUMENT_TYPES: Record<string, { Form: React.ComponentType; label: string }> = {
    approval: { Form: ApprovalForm, label: "สร้างหนังสือขออนุมัติ" },
    contract: { Form: ContractForm, label: "สร้างหนังสือสัญญา" },
    formproject: { Form: FormProjectForm, label: "สร้างเอกสารเสนอโครงการ" },
    summary: { Form: SummaryForm, label: "สร้างรายงานสรุปผล" },
    tor: { Form: TorForm, label: "สร้าง TOR" },
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ type: string }>;
}) {
    const { type } = await params;
    const config = DOCUMENT_TYPES[type];

    return {
        title: `${config?.label ?? "สร้างเอกสาร"} | ระบบจัดการเอกสาร`,
    };
}

export default async function CreateDocumentPage({
    params,
}: {
    params: Promise<{ type: string }>;
}) {
    const session = await auth();

    if (!session) {
        redirect(ROUTES.SIGNIN);
    }

    const { type } = await params;
    const config = DOCUMENT_TYPES[type];

    if (!config) {
        notFound();
    }

    return <config.Form />;
}
