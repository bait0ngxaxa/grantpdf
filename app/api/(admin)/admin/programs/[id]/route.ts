import { type NextRequest, NextResponse } from "next/server";
import { isGuardError, requireAdminSession } from "@/lib/auth-helpers";
import { updateProgram } from "@/lib/services";
import { updateProgramSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/id";
import { applyAdminMutationRateLimit } from "@/lib/adminMutationRateLimit";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const rateLimitResponse = await applyAdminMutationRateLimit(req);
        if (rateLimitResponse) return rateLimitResponse;

        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

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
        if (error instanceof Error && error.message === "PROGRAM_NAME_CONFLICT") {
            return NextResponse.json(
                { error: "มีชื่อโครงการหลักนี้อยู่แล้ว" },
                { status: 409 },
            );
        }

        if (error instanceof Error && error.message === "PROGRAM_NOT_FOUND") {
            return NextResponse.json(
                { error: "ไม่พบโครงการหลัก" },
                { status: 404 },
            );
        }

        console.error("Error updating program:", error);
        return NextResponse.json(
            { error: "ไม่สามารถอัปเดตโครงการหลักได้" },
            { status: 500 },
        );
    }
}
