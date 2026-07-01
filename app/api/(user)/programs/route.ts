import { NextResponse } from "next/server";
import { isGuardError, requireUserSession } from "@/lib/server/auth/guards";
import { getActivePrograms } from "@/lib/services/programService";

export async function GET(): Promise<NextResponse> {
    try {
        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;

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
