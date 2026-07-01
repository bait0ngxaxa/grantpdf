// เส้นแสดง dashboard user ทั่วไป
import { NextResponse } from "next/server";
import { isGuardError, requireUserSession } from "@/lib/server/auth/guards";
import { getFilesByUserId } from "@/lib/services/fileService";
import { publicErrorResponse } from "@/lib/api/responses";

export async function GET(): Promise<NextResponse> {
    try {
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

        const files = await getFilesByUserId(guard.userId);

        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error("Error fetching user documents:", error);
        return publicErrorResponse(
            error,
            "ไม่สามารถดึงข้อมูลเอกสารของผู้ใช้ได้",
        );
    }
}
