import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardActions } from "@/app/(dashboard)/userdashboard/hooks/useDashboardActions";
import { API_ROUTES } from "@/lib/constants";

const { toastSuccess, toastError } = vi.hoisted(() => ({
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        success: toastSuccess,
        error: toastError,
    },
}));

function createBaseParams() {
    return {
        fetchUserData: vi.fn().mockResolvedValue(undefined),
        setShowDeleteModal: vi.fn(),
        setShowEditProjectModal: vi.fn(),
        setShowCreateProjectModal: vi.fn(),
        fileToDelete: null,
        setFileToDelete: vi.fn(),
        projectToDelete: null,
        setProjectToDelete: vi.fn(),
        projectToEdit: {
            id: "17",
            name: "โครงการเดิม",
            description: "รายละเอียดเดิม",
            status: "กำลังดำเนินการ",
            created_at: "2024-01-01T00:00:00.000Z",
            updated_at: "2024-01-01T00:00:00.000Z",
            files: [],
            _count: { files: 0 },
        },
        setProjectToEdit: vi.fn(),
        editProjectName: "โครงการเดิม",
        setEditProjectName: vi.fn(),
        editProjectDescription: "   ",
        setEditProjectDescription: vi.fn(),
        newProjectName: "โครงการใหม่",
        setNewProjectName: vi.fn(),
        newProjectDescription: "   ",
        setNewProjectDescription: vi.fn(),
        selectedProgramId: 1,
        setSelectedProgramId: vi.fn(),
    };
}

describe("useDashboardActions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({}),
            }),
        );
    });

    it("omits an empty description when creating a project", async () => {
        const params = createBaseParams();
        const { result } = renderHook(() => useDashboardActions(params));

        await act(async () => {
            await result.current.onCreateProject();
        });

        expect(fetch).toHaveBeenCalledWith(
            API_ROUTES.PROJECTS,
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
            }),
        );

        const [, requestInit] = vi.mocked(fetch).mock.calls[0] ?? [];
        const body = JSON.parse(String(requestInit?.body));

        expect(body).toEqual({
            programId: 1,
            name: "โครงการใหม่",
        });
        expect(params.fetchUserData).toHaveBeenCalledTimes(1);
        expect(params.setShowCreateProjectModal).toHaveBeenCalledWith(false);
        expect(params.setNewProjectName).toHaveBeenCalledWith("");
        expect(params.setNewProjectDescription).toHaveBeenCalledWith("");
        expect(params.setSelectedProgramId).toHaveBeenCalledWith(null);
        expect(toastSuccess).toHaveBeenCalledWith("สร้างโครงการสำเร็จ");
    });

    it("omits an empty description when updating a project", async () => {
        const params = createBaseParams();
        const { result } = renderHook(() => useDashboardActions(params));

        await act(async () => {
            await result.current.onConfirmUpdateProject();
        });

        expect(fetch).toHaveBeenCalledWith(
            `${API_ROUTES.PROJECTS}/17`,
            expect.objectContaining({
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            }),
        );

        const [, requestInit] = vi.mocked(fetch).mock.calls[0] ?? [];
        const body = JSON.parse(String(requestInit?.body));

        expect(body).toEqual({
            name: "โครงการเดิม",
        });
        expect(params.fetchUserData).toHaveBeenCalledTimes(1);
        expect(params.setShowEditProjectModal).toHaveBeenCalledWith(false);
        expect(params.setProjectToEdit).toHaveBeenCalledWith(null);
        expect(params.setEditProjectName).toHaveBeenCalledWith("");
        expect(params.setEditProjectDescription).toHaveBeenCalledWith("");
        expect(toastSuccess).toHaveBeenCalledWith("อัปเดตโครงการสำเร็จ");
    });
});
