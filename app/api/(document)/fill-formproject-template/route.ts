import { NextResponse } from "next/server";
import {
    validateSession,
    isSessionError,
    loadTemplate,
    createDocxRenderer,
    saveDocumentToStorage,
    findOrCreateProject,
    isProjectError,
    createUserFileRecord,
    handleDocumentError,
    buildSuccessResponse,
} from "@/lib/documentRouteUtils";
import { fixThaiDistributed } from "@/lib/documentUtils";

export async function POST(req: Request) {
    try {
        // Validate session
        const sessionResult = await validateSession();
        if (isSessionError(sessionResult)) {
            return sessionResult;
        }
        const { userId } = sessionResult;

        const formData = await req.formData();

        // Extract form fields
        const projectName = formData.get("projectName") as string;
        const fileName = formData.get("fileName") as string;
        const person = formData.get("person") as string;
        const address = formData.get("address") as string;
        const tel = formData.get("tel") as string;
        const email = formData.get("email") as string;
        const timeline = formData.get("timeline") as string;
        const cost = formData.get("cost") as string;
        const rationale = formData.get("rationale") as string;
        const objective = formData.get("objective") as string;
        const goal = formData.get("goal") as string;
        const target = formData.get("target") as string;
        const product = formData.get("product") as string;
        const scope = formData.get("scope") as string;
        const result = formData.get("result") as string;
        const author = formData.get("author") as string;

        if (!projectName) {
            return new NextResponse("Project name is required.", {
                status: 400,
            });
        }

        // Load template
        const templateBuffer = await loadTemplate("formproject.docx");

        // Create document renderer
        const doc = createDocxRenderer(templateBuffer, {
            textareaFields: [
                "rationale",
                "objective",
                "goal",
                "target",
                "product",
                "scope",
                "result",
                "author",
            ],
        });

        // Prepare data for template
        const processedData = {
            projectName: fixThaiDistributed(projectName || ""),
            person: fixThaiDistributed(person || ""),
            address: fixThaiDistributed(address || ""),
            email: email || "",
            tel: tel || "",
            timeline: fixThaiDistributed(timeline || ""),
            cost: cost || "",
            rationale: fixThaiDistributed(rationale || ""),
            objective: fixThaiDistributed(objective || ""),
            goal: fixThaiDistributed(goal || ""),
            target: fixThaiDistributed(target || ""),
            product: fixThaiDistributed(product || ""),
            scope: fixThaiDistributed(scope || ""),
            result: fixThaiDistributed(result || ""),
            author: fixThaiDistributed(author || ""),
            currentDate: new Date().toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            documentType: "แบบฟอร์มข้อเสนอโครงการ",
        };

        doc.render(processedData);

        // Generate output
        const outputBuffer = doc.getZip().generate({
            type: "uint8array",
            compression: "DEFLATE",
        });

        // Save document
        const { relativeStoragePath } = await saveDocumentToStorage(
            outputBuffer,
            fileName,
            "docx"
        );

        // Find or create project
        const projectResult = await findOrCreateProject(
            userId,
            projectName,
            formData.get("projectId") as string | null,
            "สร้างจากแบบฟอร์มข้อเสนอโครงการ"
        );
        if (isProjectError(projectResult)) {
            return projectResult;
        }

        // Create database record
        await createUserFileRecord(
            userId,
            projectResult.id,
            fileName,
            relativeStoragePath,
            "docx"
        );

        return buildSuccessResponse(relativeStoragePath, projectResult);
    } catch (error) {
        return handleDocumentError(error);
    }
}
