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

const DOCUMENT_FORMS: Record<string, React.ComponentType> = {
    approval: ApprovalForm,
    contract: ContractForm,
    formproject: FormProjectForm,
    summary: SummaryForm,
    tor: TorForm,
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ type: string }>;
}) {
    const { type } = await params;
    const validTypes: Record<string, string> = {
        approval: "สร้างหนังสือขออนุมัติ",
        contract: "สร้างหนังสือสัญญา",
        formproject: "สร้างเอกสารเสนอโครงการ",
        summary: "สร้างรายงานสรุปผล",
        tor: "สร้าง TOR",
    };

    return {
        title: `${validTypes[type] || "สร้างเอกสาร"} | ระบบจัดการเอกสาร`,
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
    const FormComponent = DOCUMENT_FORMS[type];

    if (!FormComponent) {
        notFound();
    }

    return <FormComponent />;
}
