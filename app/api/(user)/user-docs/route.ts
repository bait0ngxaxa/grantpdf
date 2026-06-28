// เส้นแสดง dashboard user ทั่วไป
import { NextResponse } from "next/server";
import { auth } from "@/lib/server/auth/session";
import { getFilesByUserId } from "@/lib/services/fileService";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import {
    publicErrorResponse,
    unauthorizedResponse,
} from "@/lib/api/responses";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return unauthorizedResponse();
        }

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            return unauthorizedResponse();
        }
        const files = await getFilesByUserId(userId);

        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error("Error fetching user documents:", error);
        return publicErrorResponse(
            error,
            "ไม่สามารถดึงข้อมูลเอกสารของผู้ใช้ได้",
        );
    }
}
