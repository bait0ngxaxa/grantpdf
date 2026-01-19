import { describe, it, expect } from "vitest";
import { validateRequired } from "./helpers";

interface TestData {
    name: string;
    email: string;
    phone?: string;
}

const labels: Record<keyof TestData, string> = {
    name: "ชื่อ",
    email: "อีเมล",
    phone: "เบอร์โทร",
};

describe("validateRequired", () => {
    it("should return valid when all required fields are filled", () => {
        const data: TestData = { name: "John", email: "john@example.com" };
        const result = validateRequired(data, ["name", "email"], labels);

        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it("should return errors for missing required fields", () => {
        const data: TestData = { name: "", email: "john@example.com" };
        const result = validateRequired(data, ["name", "email"], labels);

        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe("กรุณาระบุชื่อ");
    });

    it("should return errors for null values", () => {
        const data = {
            name: null,
            email: "john@example.com",
        } as unknown as TestData;
        const result = validateRequired(data, ["name", "email"], labels);

        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe("กรุณาระบุชื่อ");
    });

    it("should return errors for undefined values", () => {
        const data = { email: "john@example.com" } as TestData;
        const result = validateRequired(data, ["name", "email"], labels);

        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe("กรุณาระบุชื่อ");
    });

    it("should return errors for whitespace-only strings", () => {
        const data: TestData = { name: "   ", email: "john@example.com" };
        const result = validateRequired(data, ["name", "email"], labels);

        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe("กรุณาระบุชื่อ");
    });

    it("should return multiple errors for multiple missing fields", () => {
        const data: TestData = { name: "", email: "" };
        const result = validateRequired(data, ["name", "email"], labels);

        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe("กรุณาระบุชื่อ");
        expect(result.errors.email).toBe("กรุณาระบุอีเมล");
    });
});
