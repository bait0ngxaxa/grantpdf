import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { RATE_LIMIT } from "@/lib/constants";
import { parsePositiveIntId } from "@/lib/id";
import { applyRateLimit } from "@/lib/ratelimit";
import { toPublicApiError } from "@/lib/apiError";
import { notificationAudienceQuerySchema } from "@/lib/validation/schemas";
import { markAllNotificationsRead } from "@/lib/services";

function unauthorizedResponse(): NextResponse {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
}

export async function PATCH(req: Request): Promise<NextResponse> {
    try {
        const rateLimitResult = await applyRateLimit({
            request: req,
            routeKey: RATE_LIMIT.USER.NOTIFICATION_MUTATION.ROUTE_KEY,
            limit: RATE_LIMIT.USER.NOTIFICATION_MUTATION.LIMIT,
            windowMs: RATE_LIMIT.USER.NOTIFICATION_MUTATION.WINDOW_MS,
        });
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่อีกครั้ง" },
                { status: 429, headers: rateLimitResult.headers },
            );
        }

        const { searchParams } = new URL(req.url);
        const parsed = notificationAudienceQuerySchema.safeParse({
            audience: searchParams.get("audience") ?? undefined,
        });
        if (!parsed.success) {
            const message = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const session = await auth();
        const userId = parsePositiveIntId(session?.user?.id);
        if (userId === null) return unauthorizedResponse();

        const updated = await markAllNotificationsRead(
            userId,
            parsed.data.audience,
        );
        return NextResponse.json(
            { success: true, updated },
            { headers: rateLimitResult.headers },
        );
    } catch (error) {
        console.error("Error marking all notifications read:", error);
        const mappedError = toPublicApiError(
            error,
            "ไม่สามารถอัปเดตการแจ้งเตือนได้",
        );
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}
