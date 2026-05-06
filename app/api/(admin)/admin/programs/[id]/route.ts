import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-helpers";
import { updateProgram } from "@/lib/services";
import { updateProgramSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/id";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!isAdmin(session)) {
            return NextResponse.json(
                { error: "ไม่มีสิทธิ์เข้าถึง" },
                { status: 403 },
            );
        }

        const { id } = await params;
        const programId = parsePositiveIntId(id);
        if (programId === null) {
            return NextResponse.json(
                { error: "รหัสโครงการหลักไม่ถูกต้อง" },
                { status: 400 },
            );
        }

        const body: unknown = await req.json();
        const parsed = updateProgramSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const program = await updateProgram(programId, parsed.data);
        return NextResponse.json(program);
    } catch (error) {
        console.error("Error updating program:", error);
        return NextResponse.json(
            { error: "ไม่สามารถอัปเดตโครงการหลักได้" },
            { status: 500 },
        );
    }
}
