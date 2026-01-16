// เส้นแสดง dashboard user ทั่วไป
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFilesByUserId } from "@/lib/services";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = Number(session.user.id);
        const files = await getFilesByUserId(userId);

        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error("Error fetching user documents:", error);
        return NextResponse.json(
            { error: "Failed to fetch user documents" },
            { status: 500 }
        );
    }
}
