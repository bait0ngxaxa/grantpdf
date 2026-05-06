import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-helpers";
import { getAllPrograms, createProgram } from "@/lib/services";
import { createProgramSchema } from "@/lib/validation/schemas";
import { RATE_LIMIT } from "@/lib/constants";
import { applyRateLimit } from "@/lib/ratelimit";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!isAdmin(session)) {
            return NextResponse.json(
                { error: "ไม่มีสิทธิ์เข้าถึง" },
                { status: 403 },
            );
        }

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
        const rateLimitResult = applyRateLimit({
            request: req,
            routeKey: RATE_LIMIT.USER.PROJECT_MUTATION.ROUTE_KEY,
            limit: RATE_LIMIT.USER.PROJECT_MUTATION.LIMIT,
            windowMs: RATE_LIMIT.USER.PROJECT_MUTATION.WINDOW_MS,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "ส่งคำขอบ่อยเกินไป" },
                { status: 429, headers: rateLimitResult.headers },
            );
        }

        const session = await auth();
        if (!isAdmin(session)) {
            return NextResponse.json(
                { error: "ไม่มีสิทธิ์เข้าถึง" },
                { status: 403 },
            );
        }

        const body: unknown = await req.json();
        const parsed = createProgramSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const program = await createProgram(parsed.data);
        return NextResponse.json(program, { status: 201 });
    } catch (error) {
        console.error("Error creating program:", error);
        return NextResponse.json(
            { error: "ไม่สามารถสร้างโครงการหลักได้" },
            { status: 500 },
        );
    }
}
