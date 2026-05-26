import { NextResponse } from "next/server";
import { isGuardError, requireAdminSession } from "@/lib/auth-helpers";
import { getAllPrograms, createProgram } from "@/lib/services";
import { createProgramSchema } from "@/lib/validation/schemas";
import { applyAdminMutationRateLimit } from "@/lib/adminMutationRateLimit";

export async function GET(): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

        const programs = await getAllPrograms();
        return NextResponse.json({ programs });
    } catch (error) {
        console.error("Error fetching programs:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลโครงการหลักได้" },
            { status: 500 },
        );
    }
}

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const rateLimitResponse = await applyAdminMutationRateLimit(req);
        if (rateLimitResponse) return rateLimitResponse;

        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

        const body: unknown = await req.json();
        const parsed = createProgramSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const program = await createProgram(parsed.data);
        return NextResponse.json(program, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === "PROGRAM_NAME_CONFLICT") {
            return NextResponse.json(
                { error: "มีชื่อโครงการหลักนี้อยู่แล้ว" },
                { status: 409 },
            );
        }

        if (
            error instanceof Error &&
            error.message === "PROGRAM_CREATE_RETRY_EXHAUSTED"
        ) {
            return NextResponse.json(
                { error: "มีการสร้างโครงการหลักพร้อมกัน กรุณาลองใหม่อีกครั้ง" },
                { status: 409 },
            );
        }

        console.error("Error creating program:", error);
        return NextResponse.json(
            { error: "ไม่สามารถสร้างโครงการหลักได้" },
            { status: 500 },
        );
    }
}
