import { describe, expect, it } from "vitest";
import { PROJECT_STATUS } from "@/type/models";
import type { AdminProject } from "@/type/models";
import { buildAdminProjectGroupViews } from "@/lib/adminProjectGrouping";

function buildProject(overrides: Partial<AdminProject>): AdminProject {
    return {
        id: "1",
        name: "โครงการทดสอบ",
        description: "",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        status: PROJECT_STATUS.IN_PROGRESS,
        userId: "10",
        userName: "ผู้ใช้ทดสอบ",
        userEmail: "user@test.com",
        files: [],
        _count: { files: 0 },
        ...overrides,
    };
}

describe("buildAdminProjectGroupViews", () => {
    it("matches numeric search terms by exact project id only", () => {
        const groups = buildAdminProjectGroupViews(
            [
                buildProject({
                    id: "12",
                    name: "โครงการตรงเลข",
                    description: "ไม่มีเลขอื่น",
                }),
                buildProject({
                    id: "112",
                    name: "โครงการ 12 ในชื่อ",
                    description: "รายละเอียดมีเลข 12",
                }),
            ],
            {
                searchTerm: "12",
                selectedStatus: "สถานะทั้งหมด",
                sortBy: "createdAtDesc",
            },
        );

        expect(groups).toHaveLength(1);
        expect(groups[0]?.items.map((project) => project.id)).toEqual(["12"]);
    });
});
