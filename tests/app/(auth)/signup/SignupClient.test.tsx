import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupClient from "@/app/(auth)/signup/SignupClient";
import { ROUTES } from "@/lib/constants";

const pushMock = vi.fn();
const replaceMock = vi.fn();
const refreshMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
        replace: replaceMock,
        refresh: refreshMock,
    }),
}));

vi.mock("sonner", () => ({
    toast: {
        success: (...args: unknown[]) => toastSuccessMock(...args),
        error: (...args: unknown[]) => toastErrorMock(...args),
    },
}));

function fillSignupForm(): void {
    fireEvent.change(screen.getByLabelText("ชื่อ-นามสกุล"), {
        target: { value: "ผู้ทดสอบ ระบบ" },
    });
    fireEvent.change(screen.getByLabelText("อีเมล"), {
        target: { value: "tester@example.com" },
    });
    fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
        target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText("ยืนยันรหัสผ่าน"), {
        target: { value: "123456" },
    });
}

async function openConfirmModal(): Promise<void> {
    fillSignupForm();
    fireEvent.click(screen.getByRole("button", { name: "ดำเนินการต่อ" }));

    await screen.findByText("ยืนยันข้อมูลการลงทะเบียน");
}

describe("SignupClient", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("redirects to dashboard with replace + refresh when signup and signin succeed", async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock
            .mockResolvedValueOnce({
                ok: true,
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
            } as Response);

        render(<SignupClient />);
        await openConfirmModal();

        fireEvent.click(screen.getByRole("button", { name: "ยืนยันการลงทะเบียน" }));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
        expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/auth/session/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "tester@example.com",
                password: "123456",
            }),
        });
        expect(replaceMock).toHaveBeenCalledWith(ROUTES.DASHBOARD);
        expect(refreshMock).toHaveBeenCalledOnce();
        expect(pushMock).not.toHaveBeenCalled();
    });

    it("redirects to signin when auto sign-in fails", async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock
            .mockResolvedValueOnce({
                ok: true,
            } as Response)
            .mockResolvedValueOnce({
                ok: false,
            } as Response);

        render(<SignupClient />);
        await openConfirmModal();

        fireEvent.click(screen.getByRole("button", { name: "ยืนยันการลงทะเบียน" }));

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith(ROUTES.SIGNIN);
        });

        expect(replaceMock).not.toHaveBeenCalled();
        expect(refreshMock).not.toHaveBeenCalled();
    });

    it("shows API error message when signup endpoint returns error", async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockResolvedValue({
            ok: false,
            json: async () => ({ error: "อีเมลนี้ถูกใช้งานแล้ว" }),
        } as Response);

        render(<SignupClient />);
        await openConfirmModal();

        fireEvent.click(screen.getByRole("button", { name: "ยืนยันการลงทะเบียน" }));

        const errorMessages = await screen.findAllByText("อีเมลนี้ถูกใช้งานแล้ว");
        expect(errorMessages.length).toBeGreaterThan(0);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(pushMock).not.toHaveBeenCalled();
        expect(replaceMock).not.toHaveBeenCalled();
    });
});
