import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/services/projectService", () => ({
    findProjectByIdAndUser: vi.fn(),
    findProjectByNameAndUser: vi.fn(),
    createProject: vi.fn(),
}));

import {
    findProjectByIdAndUser,
    findProjectByNameAndUser,
    createProject,
} from "@/lib/services/projectService";
import { findOrCreateProject } from "@/lib/document/projectService";

const mockedFindProjectByIdAndUser = vi.mocked(findProjectByIdAndUser);
const mockedFindProjectByNameAndUser = vi.mocked(findProjectByNameAndUser);
const mockedCreateProject = vi.mocked(createProject);

describe("findOrCreateProject", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when selected project has no program", async () => {
        mockedFindProjectByIdAndUser.mockResolvedValue({
            id: 12,
            name: "โครงการเดิม",
            description: "รายละเอียด",
            programId: null,
        });

        const response = await findOrCreateProject(
            7,
            "โครงการเดิม",
            "12",
            null,
            "สร้างจากเอกสาร TOR",
        );

        expect(response).toBeInstanceOf(NextResponse);
        const body = await (response as NextResponse).json();

        expect((response as NextResponse).status).toBe(400);
        expect(body.error).toContain("ยังไม่ได้กำหนดโครงการหลัก");
        expect(mockedCreateProject).not.toHaveBeenCalled();
    });

    it("creates a new project when program is provided", async () => {
        mockedFindProjectByNameAndUser.mockResolvedValue(null);
        mockedCreateProject.mockResolvedValue({
            id: "15",
            name: "โครงการใหม่",
            description: "สร้างจากเอกสาร",
            status: "กำลังดำเนินการ",
            statusNote: null,
            programId: 3,
            created_at: new Date(),
            updated_at: new Date(),
            userId: 7,
            files: [],
            _count: { files: 0 },
        } as never);

        const result = await findOrCreateProject(
            7,
            "โครงการใหม่",
            null,
            3,
            "สร้างจากเอกสาร TOR",
        );

        expect(result).toEqual({
            id: 15,
            name: "โครงการใหม่",
            description: "สร้างจากเอกสาร",
        });
        expect(mockedCreateProject).toHaveBeenCalledWith(
            7,
            "โครงการใหม่",
            "โครงการใหม่ - สร้างจากเอกสาร TOR",
            3,
        );
    });
});
