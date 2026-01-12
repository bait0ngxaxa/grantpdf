"use client";

import { notFound } from "next/navigation";
import { ApprovalForm } from "@/app/(document)/components/forms/ApprovalForm";
import { ContractForm } from "@/app/(document)/components/forms/ContractForm";
import { FormProjectForm } from "@/app/(document)/components/forms/FormProjectForm";
import { SummaryForm } from "@/app/(document)/components/forms/SummaryForm";
import { TorForm } from "@/app/(document)/components/forms/TorForm";
import { use } from "react";

const DOCUMENT_FORMS: Record<string, React.ComponentType> = {
    approval: ApprovalForm,
    contract: ContractForm,
    formproject: FormProjectForm,
    summary: SummaryForm,
    tor: TorForm,
};

export default function CreateDocumentPage({
    params,
}: {
    params: Promise<{ type: string }>;
}) {
    const { type } = use(params);
    const FormComponent = DOCUMENT_FORMS[type];

    if (!FormComponent) {
        notFound();
    }

    return <FormComponent />;
}
