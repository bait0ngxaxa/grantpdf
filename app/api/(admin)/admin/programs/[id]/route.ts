import { type NextRequest, NextResponse } from "next/server";
import { isGuardError, requireAdminSession } from "@/lib/auth-helpers";
import { updateProgram } from "@/lib/services";
import { updateProgramSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/id";
import { applyAdminMutationRateLimit } from "@/lib/adminMutationRateLimit";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import {
    publicErrorResponse,
    validationErrorResponse,
} from "@/lib/api/responses";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const rateLimitResponse = await applyAdminMutationRateLimit(req);
        if (rateLimitResponse) return rateLimitResponse;

        const { id } = await params;
        const programId = parsePositiveIntId(id);
        if (programId === null) {
            return NextResponse.json(
                { error: "รหัสโครงการหลักไม่ถูกต้อง" },
                { status: 400 },
            );
        }

        const body = await readJsonBody(req);
        const parsed = updateProgramSchema.safeParse(body);
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

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
        return publicErrorResponse(error, "ไม่สามารถอัปเดตโครงการหลักได้");
    }
}
