import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserProjectStats } from "@/lib/services";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError, toPublicApiError } from "@/lib/apiError";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 },
            );
        }

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
        }
        const stats = await getUserProjectStats(userId);

        return NextResponse.json(stats, {
            status: 200,
            headers: {
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        console.error("Error fetching user project stats:", error);
        const mappedError = toPublicApiError(error, "ไม่สามารถดึงข้อมูลสถิติโครงการได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}
