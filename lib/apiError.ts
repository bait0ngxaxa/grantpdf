import { Prisma } from "@prisma/client";

export interface PublicApiError {
    kind: "public_api_error";
    status: number;
    publicMessage: string;
}

export function publicApiError(
    status: number,
    publicMessage: string,
): PublicApiError {
    return {
        kind: "public_api_error",
        status,
        publicMessage,
    };
}

export function isPublicApiError(error: unknown): error is PublicApiError {
    if (!error || typeof error !== "object") {
        return false;
    }

    return (
        "kind" in error &&
        error.kind === "public_api_error" &&
        "status" in error &&
        typeof error.status === "number" &&
        "publicMessage" in error &&
        typeof error.publicMessage === "string"
    );
}

export function toPublicApiError(
    error: unknown,
    fallbackMessage: string,
): PublicApiError {
    if (isPublicApiError(error)) {
        return error;
    }

    if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
    ) {
        return publicApiError(404, "ไม่พบข้อมูล");
    }

    if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2000"
    ) {
        return publicApiError(400, "ข้อมูลยาวเกินกว่าที่ระบบรองรับ");
    }

    return publicApiError(500, fallbackMessage);
}
