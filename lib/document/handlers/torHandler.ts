import {
    loadTemplate,
    createDocxRenderer,
    saveDocumentToStorage,
    findOrCreateProject,
    readProgramIdFromForm,
    isProjectError,
    createUserFileRecord,
    buildSuccessResponse,
} from "@/lib/document";
import { fixThaiDistributed, normalizeRichEditorText } from "../fixThaiwordUtils";
import { NextResponse } from "next/server";
import { formatNumericWithCommas } from "@/lib/shared/utils";
import {
    activitiesJsonSchema,
    normalizePhoneNumber,
    type ActivityData,
} from "@/lib/validation/schemas";

function parseActivitiesData(
    raw: FormDataEntryValue | null,
): ActivityData[] | NextResponse {
    const result = activitiesJsonSchema.safeParse(raw);
    if (!result.success) {
        return NextResponse.json(
            {
                error:
                    result.error.issues[0]?.message ??
                    "ข้อมูลกิจกรรมไม่ถูกต้อง",
            },
            { status: 400 },
        );
    }

    return result.data;
}

export async function handleTorGeneration(
    formData: FormData,
    userId: number,
): Promise<Response> {
    // Extract form fields
    const projectName = formData.get("projectName") as string;
    const owner = formData.get("owner") as string;
    const address = formData.get("address") as string;
    const email = formData.get("email") as string;
    const tel = formData.get("tel") as string;
    const timeline = formData.get("timeline") as string;
    const contractnumber = formData.get("contractnumber") as string;
    const cost = formData.get("cost") as string;
    const topic1 = formData.get("topic1") as string;
    const objective1 = formData.get("objective1") as string;
    const target = formData.get("target") as string;
    const zone = formData.get("zone") as string;
    const plan = formData.get("plan") as string;
    const projectmanage = formData.get("projectmanage") as string;
    const partner = formData.get("partner") as string;
    const date = formData.get("date") as string;
    const fileName = formData.get("fileName") as string;

    if (!projectName) {
        return NextResponse.json(
            { error: "กรุณาระบุชื่อโครงการ" },
            { status: 400 },
        );
    }

    const activities = parseActivitiesData(formData.get("activities"));
    if (activities instanceof NextResponse) {
        return activities;
    }

    // Load template
    const templateBuffer = await loadTemplate("tor.docx", "blank_header.docx");

    // Create document renderer
    const doc = createDocxRenderer(templateBuffer, {
        textareaFields: [
            "topic1",
            "objective1",
            "target",
            "zone",
            "plan",
            "projectmanage",
            "partner",
            "activity",
            "manager",
            "evaluation2",
            "duration",
        ],
    });

    // Process activities while preserving rich editor line/tab structure.
    const processedActivities = activities.map(
        (activity: Record<string, unknown>) => ({
            ...activity,
            ...(typeof activity === "object"
                ? Object.keys(activity).reduce(
                      (acc, key) => {
                          const value = activity[key];
                          if (typeof value === "string") {
                              acc[key] = normalizeRichEditorText(value);
                          } else {
                              acc[key] = value;
                          }
                          return acc;
                      },
                      {} as Record<string, unknown>,
                  )
                : activity),
        }),
    );

    // Prepare data for template
    const processedData = {
        projectName: fixThaiDistributed(projectName || ""),
        owner: fixThaiDistributed(owner || ""),
        address: fixThaiDistributed(address || ""),
        email: email || "",
        tel: normalizePhoneNumber(tel || ""),
        timeline: fixThaiDistributed(timeline || ""),
        contractnumber: contractnumber || "",
        cost: formatNumericWithCommas(cost || ""),
        topic1: normalizeRichEditorText(topic1 || ""),
        objective1: normalizeRichEditorText(objective1 || ""),
        target: normalizeRichEditorText(target || ""),
        zone: normalizeRichEditorText(zone || ""),
        plan: normalizeRichEditorText(plan || ""),
        projectmanage: normalizeRichEditorText(projectmanage || ""),
        partner: normalizeRichEditorText(partner || ""),
        date: date || "",
        activities: processedActivities,
        hasActivities: processedActivities.length > 0,
        activitiesCount: processedActivities.length,
        currentDate: new Date().toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        documentType: "Terms of Reference (TOR)",
    };

    doc.render(processedData);

    // Generate output
    const outputBuffer = doc.getZip().generate({
        type: "uint8array",
        compression: "DEFLATE",
    });

    // Find or create project
    const projectResult = await findOrCreateProject(
        userId,
        projectName,
        formData.get("projectId") as string | null,
        readProgramIdFromForm(formData),
        "สร้างจากเอกสาร TOR",
    );
    if (isProjectError(projectResult)) {
        return projectResult;
    }

    // Save document + create database record (with cleanup on DB failure)
    const { relativeStoragePath } = await saveDocumentToStorage(
        outputBuffer,
        fileName,
        "docx",
        async (storagePath: string): Promise<void> => {
            await createUserFileRecord(
                userId,
                projectResult.id,
                fileName,
                storagePath,
                "docx",
            );
        },
    );

    return buildSuccessResponse(relativeStoragePath, projectResult);
}
