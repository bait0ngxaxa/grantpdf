// เส้นแสดง dashboard user ทั่วไป
import { type NextRequest, NextResponse } from "next/server";
import { isGuardError, requireUserSession } from "@/lib/server/auth/guards";
import { getFilesByUserId } from "@/lib/services/fileService";
import { PAGINATION } from "@/lib/shared/constants";
import { getFirstValidationMessage } from "@/lib/api/body";
import {
    publicErrorResponse,
    validationErrorResponse,
} from "@/lib/api/responses";
import { userDocumentsQuerySchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        const { searchParams } = new URL(req.url);
        const parsed = userDocumentsQuerySchema.safeParse({
            cursor: searchParams.get("cursor") ?? undefined,
            limit: searchParams.get("limit") ?? undefined,
        });
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const result = await getFilesByUserId({
            userId: guard.userId,
            limit: Math.min(
                parsed.data.limit,
                PAGINATION.USER_DOCUMENTS_API_MAX_LIMIT,
            ),
            cursor: parsed.data.cursor,
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching user documents:", error);
        return publicErrorResponse(
            error,
            "ไม่สามารถดึงข้อมูลเอกสารของผู้ใช้ได้",
        );
    }
}
