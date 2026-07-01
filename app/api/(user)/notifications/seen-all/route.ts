import { NextResponse } from "next/server";
import { isGuardError, requireUserSession } from "@/lib/server/auth/guards";
import { RATE_LIMIT } from "@/lib/shared/constants";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import { notificationAudienceQuerySchema } from "@/lib/validation/schemas";
import { markAllNotificationsSeen } from "@/lib/services/notificationService";
import { getFirstValidationMessage } from "@/lib/api/body";
import {
    publicErrorResponse,
    rateLimitExceededResponse,
    validationErrorResponse,
} from "@/lib/api/responses";

export async function PATCH(req: Request): Promise<NextResponse> {
    try {
        const rateLimitResult = await applyRateLimit({
            request: req,
            routeKey: RATE_LIMIT.USER.NOTIFICATION_MUTATION.ROUTE_KEY,
            limit: RATE_LIMIT.USER.NOTIFICATION_MUTATION.LIMIT,
            windowMs: RATE_LIMIT.USER.NOTIFICATION_MUTATION.WINDOW_MS,
        });
        if (!rateLimitResult.success) {
            return rateLimitExceededResponse(
                rateLimitResult,
                "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่อีกครั้ง",
            );
        }

        const { searchParams } = new URL(req.url);
        const parsed = notificationAudienceQuerySchema.safeParse({
            audience: searchParams.get("audience") ?? undefined,
        });
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        const updated = await markAllNotificationsSeen(
            guard.userId,
            parsed.data.audience,
        );
        return NextResponse.json(
            { success: true, updated },
            { headers: rateLimitResult.headers },
        );
    } catch (error) {
        console.error("Error marking all notifications seen:", error);
        return publicErrorResponse(error, "ไม่สามารถอัปเดตการแจ้งเตือนได้");
    }
}
