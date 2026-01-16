//เส้นดึงข้อมูลจาก table userFile มาแสดงผล dashboard admin

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllFilesForAdmin } from "@/lib/services";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const files = await getAllFilesForAdmin();
        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error("Error fetching all documents:", error);
        return NextResponse.json(
            { error: "Failed to fetch all documents" },
            { status: 500 }
        );
    }
}
