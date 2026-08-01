import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "@/components/ui/ErrorState";

vi.mock("next/link", () => ({
    default: ({ href, children }: { href: string; children: ReactNode }) => (
        <a href={href}>{children}</a>
    ),
}));

describe("ErrorState", () => {
    it("announces the error and provides retry and home actions", () => {
        const onRetry = vi.fn();

        render(
            <ErrorState
                title="ไม่สามารถโหลดข้อมูลโครงการได้"
                description="กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง"
                onRetry={onRetry}
            />,
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: "ไม่สามารถโหลดข้อมูลโครงการได้",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "ลองใหม่อีกครั้ง" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "กลับหน้าหลัก" }),
        ).toHaveAttribute("href", "/");

        fireEvent.click(screen.getByRole("button", { name: "ลองใหม่อีกครั้ง" }));

        expect(onRetry).toHaveBeenCalledOnce();
    });
});
