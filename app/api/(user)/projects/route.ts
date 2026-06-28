import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/server/auth/session";
import {
    getProjectSummariesByUserId,
    getProjectsByUserIdPaginated,
    createProjectWithAudit,
} from "@/lib/services/projectService";
import { programExists } from "@/lib/services/programService";
import { PAGINATION, RATE_LIMIT } from "@/lib/shared/constants";
import { parsePositiveInt } from "@/lib/shared/http/queryParams";
import { createProjectSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { publicApiError } from "@/lib/shared/http/apiError";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import { buildAuditContext } from "@/lib/api/requestContext";
import {
    publicErrorResponse,
    rateLimitExceededResponse,
    unauthorizedResponse,
    validationErrorResponse,
} from "@/lib/api/responses";

const PROJECT_SUMMARY_VIEW = "summary";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
        }
        const { searchParams } = new URL(req.url);
        const view = searchParams.get("view");
        if (view === PROJECT_SUMMARY_VIEW) {
            const projects = await getProjectSummariesByUserId(userId);

            return NextResponse.json({ projects });
        }

        const page = parsePositiveInt(searchParams.get("page"), 1);
        const requestedLimit = parsePositiveInt(
            searchParams.get("limit"),
            PAGINATION.PROJECTS_PER_PAGE,
        );
        const limit = Math.min(
            requestedLimit,
            PAGINATION.USER_PROJECTS_API_PAGE_LIMIT,
        );
        const programId = parsePositiveIntId(searchParams.get("programId"));
        const search = searchParams.get("search") ?? undefined;
        const status = searchParams.get("status") ?? undefined;
        const sortBy = searchParams.get("sortBy") ?? undefined;
        const result = await getProjectsByUserIdPaginated({
            userId,
            page,
            limit,
            programId: programId ?? undefined,
            search,
            status,
            sortBy,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return publicErrorResponse(error, "ไม่สามารถดึงข้อมูลโครงการได้");
    }
}

// POST: สร้างโครงการใหม่ (ต้องเลือกโครงการหลักก่อน)
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const rateLimitResult = await applyRateLimit({
            request: req,
            routeKey: RATE_LIMIT.USER.PROJECT_MUTATION.ROUTE_KEY,
            limit: RATE_LIMIT.USER.PROJECT_MUTATION.LIMIT,
            windowMs: RATE_LIMIT.USER.PROJECT_MUTATION.WINDOW_MS,
        });

        if (!rateLimitResult.success) {
            return rateLimitExceededResponse(
                rateLimitResult,
                "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่อีกครั้ง",
            );
        }

        const body = await readJsonBody(req);
        const parsed = createProjectSchema.safeParse(body);
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const { name, description, programId } = parsed.data;
        const session = await auth();

        if (!session?.user?.id) {
            return unauthorizedResponse();
        }

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
        }

        // Verify program exists and is active
        const validProgram = await programExists(programId);
        if (!validProgram) {
            return NextResponse.json(
                { error: "โครงการหลักที่เลือกไม่ถูกต้องหรือถูกปิดใช้งาน" },
                { status: 400 },
            );
        }

        const safeDescription = description && description.trim() !== "" ? description : undefined;
        const project = await createProjectWithAudit(
            userId,
            name,
            safeDescription,
            programId,
            buildAuditContext(session, req),
        );

        return NextResponse.json(project, { headers: rateLimitResult.headers });
    } catch (error) {
        if (error instanceof Error && error.message === "PROJECT_NAME_CONFLICT") {
            return NextResponse.json(
                {
                    error: "มีชื่อโครงการนี้อยู่แล้วภายใต้โครงการหลักอื่น กรุณาเปลี่ยนชื่อโครงการ",
                },
                { status: 409 },
            );
        }

        console.error("Error creating project:", error);
        return publicErrorResponse(error, "ไม่สามารถสร้างโครงการได้");
    }
}
