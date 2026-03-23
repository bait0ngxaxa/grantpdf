import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjectsByUserId, getProjectsByUserIdPaginated } from "@/lib/services";
import { PAGINATION } from "@/lib/constants";
import { parsePositiveInt } from "@/lib/queryParams";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = Number(session.user.id);
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
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
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

        const { name, description } = await req.json();

        if (!name) {
            return NextResponse.json(
                { error: "Project name is required" },
                { status: 400 }
            );
        }

        const userId = Number(session.user.id);

        const { createProject } = await import("@/lib/services");
        const project = await createProject(userId, name, description);

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}
