import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parsePositiveIntId } from "@/lib/id";
import { toPublicApiError } from "@/lib/apiError";
import { notificationListQuerySchema } from "@/lib/validation/schemas";
import { getNotificationsForUser } from "@/lib/services";

function unauthorizedResponse(): NextResponse {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
}

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
            const message = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: message }, { status: 400 });
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
        const mappedError = toPublicApiError(
            error,
            "ไม่สามารถดึงการแจ้งเตือนได้",
        );
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}
