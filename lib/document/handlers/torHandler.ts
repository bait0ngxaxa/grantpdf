import {
    loadTemplate,
    createDocxRenderer,
    saveDocumentToStorage,
    findOrCreateProject,
    isProjectError,
    createUserFileRecord,
    buildSuccessResponse,
} from "@/lib/document";
import { fixThaiDistributed } from "../utils";
import { NextResponse } from "next/server";

export async function handleTorGeneration(
    formData: FormData,
    userId: number
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
        return new NextResponse("Project name is required.", {
            status: 400,
        });
    }

    // Parse activities data
    const activitiesData = formData.get("activities") as string;
    let activities: Record<string, unknown>[] = [];
    if (activitiesData) {
        try {
            activities = JSON.parse(activitiesData);
        } catch (error) {
            console.error("Error parsing activities data:", error);
            activities = [];
        }
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
        ],
    });

    // Process activities with Thai formatting
    const processedActivities = activities.map(
        (activity: Record<string, unknown>) => ({
            ...activity,
            ...(typeof activity === "object"
                ? Object.keys(activity).reduce((acc, key) => {
                      const value = activity[key];
                      if (typeof value === "string") {
                          acc[key] = fixThaiDistributed(value);
                      } else {
                          acc[key] = value;
                      }
                      return acc;
                  }, {} as Record<string, unknown>)
                : activity),
        })
    );

    // Prepare data for template
    const processedData = {
        projectName: fixThaiDistributed(projectName || ""),
        owner: fixThaiDistributed(owner || ""),
        address: fixThaiDistributed(address || ""),
        email: email || "",
        tel: tel || "",
        timeline: fixThaiDistributed(timeline || ""),
        contractnumber: contractnumber || "",
        cost: cost || "",
        topic1: fixThaiDistributed(topic1 || ""),
        objective1: fixThaiDistributed(objective1 || ""),
        target: fixThaiDistributed(target || ""),
        zone: fixThaiDistributed(zone || ""),
        plan: fixThaiDistributed(plan || ""),
        projectmanage: fixThaiDistributed(projectmanage || ""),
        partner: fixThaiDistributed(partner || ""),
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
        "สร้างจากเอกสาร TOR"
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
}
