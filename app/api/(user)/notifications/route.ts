import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/server/auth/session";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { notificationListQuerySchema } from "@/lib/validation/schemas";
import { getNotificationsForUser } from "@/lib/services/notificationService";
import { getFirstValidationMessage } from "@/lib/api/body";
import {
    publicErrorResponse,
    unauthorizedResponse,
    validationErrorResponse,
} from "@/lib/api/responses";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();
        const userId = parsePositiveIntId(session?.user?.id);
        if (userId === null) return unauthorizedResponse();

        const { searchParams } = new URL(req.url);
        const parsed = notificationListQuerySchema.safeParse({
            cursor: searchParams.get("cursor") ?? undefined,
            limit: searchParams.get("limit") ?? undefined,
            unreadOnly: searchParams.get("unreadOnly") ?? undefined,
            audience: searchParams.get("audience") ?? undefined,
        });
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const result = await getNotificationsForUser({
            userId,
            cursor: parsed.data.cursor,
            limit: parsed.data.limit,
            unreadOnly: parsed.data.unreadOnly,
            audience: parsed.data.audience,
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return publicErrorResponse(error, "ไม่สามารถดึงการแจ้งเตือนได้");
    }
}
