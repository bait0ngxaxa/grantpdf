//เส้นดึงข้อมูลจาก table userFile มาแสดงผล dashboard admin

import { NextResponse } from "next/server";
import { getAllFilesForAdmin } from "@/lib/services/fileService";
import { requireAdminSession, isGuardError } from "@/lib/server/auth/guards";

export async function GET(): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

        const files = await getAllFilesForAdmin(50);
        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error("Error fetching all documents:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลเอกสารทั้งหมดได้" },
            { status: 500 },
        );
    }
}
