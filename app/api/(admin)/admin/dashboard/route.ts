//เส้นดึงข้อมูลจาก table userFile มาแสดงผล dashboard admin

import { NextResponse } from "next/server";
import { getAllFilesForAdmin } from "@/lib/services";
import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";

export async function GET(): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

        const files = await getAllFilesForAdmin();
        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error("Error fetching all documents:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลเอกสารทั้งหมดได้" },
            { status: 500 },
        );
    }
}
