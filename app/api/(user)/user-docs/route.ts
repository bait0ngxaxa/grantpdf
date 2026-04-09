// เส้นแสดง dashboard user ทั่วไป
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFilesByUserId } from "@/lib/services";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError, toPublicApiError } from "@/lib/apiError";

export async function GET(): Promise<NextResponse> {
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
        const files = await getFilesByUserId(userId);

        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error("Error fetching user documents:", error);
        const mappedError = toPublicApiError(error, "ไม่สามารถดึงข้อมูลเอกสารของผู้ใช้ได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
