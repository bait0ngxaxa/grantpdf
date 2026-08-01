import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SigninClient from "@/app/(auth)/signin/SigninClient";

const pushMock = vi.fn();
const replaceMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
        replace: replaceMock,
    }),
}));

vi.mock("sonner", () => ({
    toast: {
        success: (...args: unknown[]) => toastSuccessMock(...args),
        error: (...args: unknown[]) => toastErrorMock(...args),
    },
}));

describe("SigninClient", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("replaces immediately after successful sign-in and keeps the form disabled while navigating", async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock
            .mockResolvedValueOnce({
                status: 200,
                json: async () => ({}),
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
            } as Response);

        render(<SigninClient callbackUrl="/requested-page" />);

        fireEvent.change(screen.getByLabelText("อีเมล"), {
            target: { value: "tester@example.com" },
        });
        fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
            target: { value: "password" },
        });
        fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

        expect(toastSuccessMock).toHaveBeenCalledWith(
            "เข้าสู่ระบบสำเร็จ",
            expect.objectContaining({
                description: expect.any(String),
            }),
        );
        expect(replaceMock).toHaveBeenCalledWith("/requested-page");
        expect(pushMock).not.toHaveBeenCalled();
        expect(
            screen.getByRole("button", { name: "กำลังเข้าสู่ระบบ…" }),
        ).toBeDisabled();
    });
});
