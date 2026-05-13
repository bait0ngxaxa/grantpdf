import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
    getProjectSummariesByUserId,
    getProjectsByUserIdPaginated,
    createProjectWithAudit,
    programExists,
} from "@/lib/services";
import { PAGINATION, RATE_LIMIT } from "@/lib/constants";
import { parsePositiveInt } from "@/lib/queryParams";
import { createProjectSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError, toPublicApiError } from "@/lib/apiError";
import { applyRateLimit, getClientIP } from "@/lib/ratelimit";

const PROJECT_SUMMARY_VIEW = "summary";
const MAX_PROJECTS_PAGE_LIMIT = 25;

function getRequestId(req: Request): string | undefined {
    return req.headers.get("x-request-id") || undefined;
}

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
        const limit = Math.min(requestedLimit, MAX_PROJECTS_PAGE_LIMIT);
        const result = await getProjectsByUserIdPaginated({ userId, page, limit });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching projects:", error);
        const mappedError = toPublicApiError(error, "ไม่สามารถดึงข้อมูลโครงการได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}

// POST: สร้างโครงการใหม่ (ต้องเลือกโครงการหลักก่อน)
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 },
            );
        }

        const rateLimitResult = await applyRateLimit({
            request: req,
            routeKey: RATE_LIMIT.USER.PROJECT_MUTATION.ROUTE_KEY,
            limit: RATE_LIMIT.USER.PROJECT_MUTATION.LIMIT,
            windowMs: RATE_LIMIT.USER.PROJECT_MUTATION.WINDOW_MS,
            identifier: session.user.id,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่อีกครั้ง",
                    retryAfter: rateLimitResult.retryAfter,
                },
                { status: 429, headers: rateLimitResult.headers },
            );
        }

        const body: unknown = await req.json();
        const parsed = createProjectSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const { name, description, programId } = parsed.data;

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
            {
                actorUserId: session.user.id,
                actorEmail: session.user.email ?? undefined,
                ip: getClientIP(req),
                userAgent: req.headers.get("user-agent") ?? undefined,
                requestId: getRequestId(req),
            },
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
        const mappedError = toPublicApiError(error, "ไม่สามารถสร้างโครงการได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
