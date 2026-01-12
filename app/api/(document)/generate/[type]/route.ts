import { NextResponse } from "next/server";
import {
    validateSession,
    isSessionError,
    handleDocumentError,
} from "@/lib/document";
import { handleTorGeneration } from "@/lib/document-handlers/torHandler";
import { handleApprovalGeneration } from "@/lib/document-handlers/approvalHandler";
import { handleContractGeneration } from "@/lib/document-handlers/contractHandler";
import { handleFormProjectGeneration } from "@/lib/document-handlers/formProjectHandler";
import { handleSummaryGeneration } from "@/lib/document-handlers/summaryHandler";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ type: string }> }
) {
    try {
        // Validate session
        const sessionResult = await validateSession();
        if (isSessionError(sessionResult)) {
            return sessionResult;
        }
        const { userId } = sessionResult;
        const { type } = await params;

        const formData = await req.formData();

        switch (type) {
            case "tor":
                return await handleTorGeneration(formData, userId);
            case "approval":
                return await handleApprovalGeneration(formData, userId);
            case "contract":
                return await handleContractGeneration(formData, userId);
            case "formproject":
                return await handleFormProjectGeneration(formData, userId);
            case "summary":
                return await handleSummaryGeneration(formData, userId);
            default:
                return new NextResponse("Invalid document type", {
                    status: 400,
                });
        }
    } catch (error) {
        return handleDocumentError(error);
    }
}
