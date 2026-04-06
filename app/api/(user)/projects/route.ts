import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjectsByUserId, getProjectsByUserIdPaginated } from "@/lib/services";
import { PAGINATION } from "@/lib/constants";
import { parsePositiveInt } from "@/lib/queryParams";
import { createProjectSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError, toPublicApiError } from "@/lib/apiError";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "Unauthorized");
        }
        const { searchParams } = new URL(req.url);
        const hasPaginationParams =
            searchParams.has("page") || searchParams.has("limit");

        if (!hasPaginationParams) {
            const projects = await getProjectsByUserId(userId);

            return NextResponse.json({ projects });
        }

        const page = parsePositiveInt(searchParams.get("page"), 1);
        const limit = parsePositiveInt(
            searchParams.get("limit"),
            PAGINATION.PROJECTS_PER_PAGE,
        );
        const result = await getProjectsByUserIdPaginated({ userId, page, limit });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching projects:", error);
        const mappedError = toPublicApiError(error, "Failed to fetch projects");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}

// POST: สร้างโครงการใหม่
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body: unknown = await req.json();
        const parsed = createProjectSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const { name, description } = parsed.data;

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "Unauthorized");
        }

        const { createProject } = await import("@/lib/services");
        const safeDescription = description && description.trim() !== "" ? description : undefined;
        const project = await createProject(userId, name, safeDescription);

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error creating project:", error);
        const mappedError = toPublicApiError(error, "Failed to create project");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
