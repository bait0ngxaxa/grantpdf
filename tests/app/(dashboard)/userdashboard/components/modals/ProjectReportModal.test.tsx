import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { REPORT_STATUS, REPORT_TYPES } from "@/lib/shared/constants";
import type { Project, ProjectReport } from "@/type";

const uploadMocks = vi.hoisted(() => ({
    createUploadIdempotencyKey: vi.fn(),
    fetchWithUploadRetry: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock("@/lib/upload/clientRequest", () => ({
    createUploadIdempotencyKey: uploadMocks.createUploadIdempotencyKey,
    fetchWithUploadRetry: uploadMocks.fetchWithUploadRetry,
}));

vi.mock("sonner", () => ({
    toast: toastMocks,
}));

import { ProjectReportModal } from "@/app/(dashboard)/userdashboard/components/modals/ProjectReportModal";

const project: Project = {
    id: "88",
    name: "โครงการทดสอบ",
    description: "รายละเอียด",
    status: "กำลังดำเนินการ",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    files: [],
    reports: [],
    _count: {
        files: 0,
    },
};

const submittedReport: ProjectReport = {
    id: "9001",
    projectId: "88",
    userId: "7",
    fileId: "501",
    reportType: REPORT_TYPES.PROGRESS,
    status: REPORT_STATUS.PENDING_REVIEW,
    note: "",
    submittedAt: "2026-01-02T00:00:00.000Z",
    file: {
        id: "501",
        originalFileName: "report.pdf",
        storagePath: "storage/reports/report.pdf",
        created_at: "2026-01-02T00:00:00.000Z",
        updated_at: "2026-01-02T00:00:00.000Z",
        fileExtension: ".pdf",
    },
};

describe("ProjectReportModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(Response.json({ reports: [] })),
        );
        uploadMocks.createUploadIdempotencyKey.mockReturnValue("upload-key");
        uploadMocks.fetchWithUploadRetry.mockResolvedValue(
            Response.json({
                report: submittedReport,
                message: "ส่งรายงานโครงการสำเร็จ",
            }),
        );
    });

    it("refreshes project metadata after a report is submitted", async () => {
        const onClose = vi.fn();
        const onReportSubmitted = vi.fn().mockResolvedValue(undefined);
        render(
            <ProjectReportModal
                isOpen
                project={project}
                onClose={onClose}
                onReportSubmitted={onReportSubmitted}
            />,
        );

        const fileInput = document.querySelector<HTMLInputElement>(
            'input[type="file"]',
        );
        expect(fileInput).not.toBeNull();

        fireEvent.change(fileInput as HTMLInputElement, {
            target: {
                files: [
                    new File(["report"], "report.pdf", {
                        type: "application/pdf",
                    }),
                ],
            },
        });
        fireEvent.click(screen.getByRole("button", { name: /ส่งรายงาน$/ }));

        await waitFor(() => {
            expect(onReportSubmitted).toHaveBeenCalledOnce();
        });
    });
});
