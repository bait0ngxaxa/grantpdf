import { NextResponse } from "next/server";
import { auth } from "@/lib/server/auth/session";
import { getActivePrograms } from "@/lib/services/programService";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 },
            );
        }

        const programs = await getActivePrograms();

        return NextResponse.json({ programs });
    } catch (error) {
        console.error("Error fetching programs:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลโครงการหลักได้" },
            { status: 500 },
        );
    }
}
