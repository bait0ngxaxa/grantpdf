import { NextResponse } from "next/server";
import { isGuardError, requireAdminSession } from "@/lib/server/auth/guards";
import { getAllPrograms, createProgram } from "@/lib/services/programService";
import { createProgramSchema } from "@/lib/validation/schemas";
import { applyAdminMutationRateLimit } from "@/lib/server/rate-limit/adminMutationRateLimit";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import {
    publicErrorResponse,
    validationErrorResponse,
} from "@/lib/api/responses";

export async function GET(): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

        const programs = await getAllPrograms();
        return NextResponse.json({ programs });
    } catch (error) {
        console.error("Error fetching programs:", error);
        return publicErrorResponse(error, "ไม่สามารถดึงข้อมูลโครงการหลักได้");
    }
}

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const rateLimitResponse = await applyAdminMutationRateLimit(req);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await readJsonBody(req);
        const parsed = createProgramSchema.safeParse(body);
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

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
        return publicErrorResponse(error, "ไม่สามารถสร้างโครงการหลักได้");
    }
}
