"use client";

import { notFound } from "next/navigation";
import {
    ApprovalForm,
    ContractForm,
    FormProjectForm,
    SummaryForm,
    TorForm,
} from "@/app/(document)/components";
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
}): React.JSX.Element {
    const { type } = use(params);
    const FormComponent = DOCUMENT_FORMS[type];

    if (!FormComponent) {
        notFound();
    }

    return <FormComponent />;
}
