import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateProjectSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError, toPublicApiError } from "@/lib/apiError";
import {
    updateProjectWithAudit,
    deleteProjectWithAudit,
} from "@/lib/services";
import { applyRateLimit } from "@/lib/ratelimit";
import { RATE_LIMIT } from "@/lib/constants";

function getClientIp(req: NextRequest): string | undefined {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        const [firstIp] = forwarded.split(",");
        return firstIp?.trim() || undefined;
    }
    return req.headers.get("x-real-ip") || undefined;
}

function getRequestId(req: NextRequest): string | undefined {
    return req.headers.get("x-request-id") || undefined;
}

// PUT: อัพเดตโครงการ
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

        const resolvedParams = await params;
        const projectId = parsePositiveIntId(resolvedParams.id);
        if (projectId === null) {
            throw publicApiError(400, "รหัสโครงการไม่ถูกต้อง");
        }

        const body: unknown = await req.json();
        const parsed = updateProjectSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }
        const { name, description } = parsed.data;

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
        }

        const updatedProject = await updateProjectWithAudit(
            projectId,
            userId,
            name,
            description && description.trim() !== "" ? description : undefined,
            {
                actorUserId: session.user.id,
                actorEmail: session.user.email ?? undefined,
                ip: getClientIp(req),
                userAgent: req.headers.get("user-agent") ?? undefined,
                requestId: getRequestId(req),
            },
        );

        return NextResponse.json({
            ...updatedProject,
            id: updatedProject.id.toString(),
        }, { headers: rateLimitResult.headers });
    } catch (error) {
        if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
            return NextResponse.json(
                { error: "ไม่พบโครงการ" },
                { status: 404 },
            );
        }
        if (error instanceof Error && error.message === "PROJECT_NAME_CONFLICT") {
            return NextResponse.json(
                { error: "มีชื่อโครงการนี้อยู่แล้ว" },
                { status: 409 },
            );
        }

        console.error("Error updating project:", error);
        const mappedError = toPublicApiError(error, "ไม่สามารถอัปเดตโครงการได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}

// DELETE: ลบโครงการ
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

        const resolvedParams = await params;
        const projectId = parsePositiveIntId(resolvedParams.id);
        if (projectId === null) {
            throw publicApiError(400, "รหัสโครงการไม่ถูกต้อง");
        }

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
        }

        await deleteProjectWithAudit(projectId, userId, {
            actorUserId: session.user.id,
            actorEmail: session.user.email ?? undefined,
            ip: getClientIp(req),
            userAgent: req.headers.get("user-agent") ?? undefined,
            requestId: getRequestId(req),
        });

        return NextResponse.json(
            { message: "ลบโครงการสำเร็จ" },
            { headers: rateLimitResult.headers },
        );
    } catch (error) {
        if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
            return NextResponse.json(
                { error: "ไม่พบโครงการ" },
                { status: 404 },
            );
        }
        if (
            error instanceof Error &&
            error.message === "PROJECT_DELETE_FORBIDDEN"
        ) {
            return NextResponse.json(
                { error: "เฉพาะเจ้าของโครงการเท่านั้นที่ลบโครงการได้" },
                { status: 403 },
            );
        }

        console.error("Error deleting project:", error);
        const mappedError = toPublicApiError(error, "ไม่สามารถลบโครงการได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
