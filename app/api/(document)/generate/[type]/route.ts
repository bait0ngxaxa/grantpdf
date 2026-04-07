import { NextResponse } from "next/server";
import {
    validateSession,
    isSessionError,
    handleDocumentError,
} from "@/lib/document";
import { applyRateLimit } from "@/lib/ratelimit";
import { RATE_LIMIT } from "@/lib/constants";
import { logAudit } from "@/lib/auditLog";
import {
    normalizeIdempotencyKey,
    startDocumentIdempotency,
    completeDocumentIdempotency,
    failDocumentIdempotency,
} from "@/lib/services";
import {
    handleTorGeneration,
    handleApprovalGeneration,
    handleContractGeneration,
    handleFormProjectGeneration,
    handleSummaryGeneration,
} from "@/lib/document/handlers";
import {
    approvalSchema,
    contractSchema,
    formProjectSchema,
    summarySchema,
    torSchema,
} from "@/lib/validation/schemas";

type DocumentType = "tor" | "approval" | "contract" | "formproject" | "summary";

function getTextField(formData: FormData, key: string): string {
    const raw = formData.get(key);
    return typeof raw === "string" ? raw : "";
}

function parseStringArrayJson(raw: string): string[] {
    if (!raw) return [];

    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((item): item is string => typeof item === "string");
    } catch {
        return [];
    }
}

function validateDocumentPayload(
    type: DocumentType,
    formData: FormData,
): string | null {
    const validators = {
        tor: () =>
            torSchema.safeParse({
                projectName: getTextField(formData, "projectName"),
                fileName: getTextField(formData, "fileName"),
                owner: getTextField(formData, "owner"),
                address: getTextField(formData, "address"),
                email: getTextField(formData, "email"),
                tel: getTextField(formData, "tel"),
                timeline: getTextField(formData, "timeline"),
                contractnumber: getTextField(formData, "contractnumber"),
                cost: getTextField(formData, "cost"),
                topic1: getTextField(formData, "topic1"),
                objective1: getTextField(formData, "objective1"),
                target: getTextField(formData, "target"),
                zone: getTextField(formData, "zone"),
                plan: getTextField(formData, "plan"),
                projectmanage: getTextField(formData, "projectmanage"),
                partner: getTextField(formData, "partner"),
                date: getTextField(formData, "date"),
            }),
        approval: () =>
            approvalSchema.safeParse({
                head: getTextField(formData, "head"),
                fileName: getTextField(formData, "fileName"),
                projectName: getTextField(formData, "projectName"),
                date: getTextField(formData, "date"),
                topicdetail: getTextField(formData, "topicdetail"),
                todetail: getTextField(formData, "todetail"),
                attachments: parseStringArrayJson(
                    getTextField(formData, "attachments"),
                ),
                detail: getTextField(formData, "detail"),
                name: getTextField(formData, "name"),
                depart: getTextField(formData, "depart"),
                coor: getTextField(formData, "coor"),
                tel: getTextField(formData, "tel"),
                email: getTextField(formData, "email"),
                accept: getTextField(formData, "accept"),
            }),
        contract: () =>
            contractSchema.safeParse({
                fileName: getTextField(formData, "fileName"),
                projectName: getTextField(formData, "projectName"),
                contractnumber: getTextField(formData, "contractnumber"),
                projectOffer: getTextField(formData, "projectOffer"),
                projectCo: getTextField(formData, "projectCo"),
                owner: getTextField(formData, "owner"),
                acceptNum: getTextField(formData, "acceptNum"),
                projectCode: getTextField(formData, "projectCode"),
                cost: getTextField(formData, "cost"),
                timelineMonth: getTextField(formData, "timelineMonth"),
                timelineText: getTextField(formData, "timelineText"),
                section: getTextField(formData, "section"),
                date: getTextField(formData, "date"),
                name: getTextField(formData, "name"),
                address: getTextField(formData, "address"),
                citizenid: getTextField(formData, "citizenid"),
                citizenexpire: getTextField(formData, "citizenexpire"),
                witness: getTextField(formData, "witness"),
            }),
        formproject: () =>
            formProjectSchema.safeParse({
                fileName: getTextField(formData, "fileName"),
                projectName: getTextField(formData, "projectName"),
                person: getTextField(formData, "person"),
                address: getTextField(formData, "address"),
                tel: getTextField(formData, "tel"),
                email: getTextField(formData, "email"),
                timeline: getTextField(formData, "timeline"),
                cost: getTextField(formData, "cost"),
                rationale: getTextField(formData, "rationale"),
                objective: getTextField(formData, "objective"),
                goal: getTextField(formData, "goal"),
                target: getTextField(formData, "target"),
                product: getTextField(formData, "product"),
                scope: getTextField(formData, "scope"),
                result: getTextField(formData, "result"),
                author: getTextField(formData, "author"),
            }),
        summary: () =>
            summarySchema.safeParse({
                fileName: getTextField(formData, "fileName"),
                projectName: getTextField(formData, "projectName"),
                contractNumber: getTextField(formData, "contractNumber"),
                organize: getTextField(formData, "organize"),
                projectOwner: getTextField(formData, "projectOwner"),
                projectReview: getTextField(formData, "projectReview"),
                inspector: getTextField(formData, "inspector"),
                coordinator: getTextField(formData, "coordinator"),
                projectCode: getTextField(formData, "projectCode"),
                projectActivity: getTextField(formData, "projectActivity"),
                projectNhf: getTextField(formData, "projectNhf"),
                projectCo: getTextField(formData, "projectCo"),
                month: getTextField(formData, "month"),
                timeline: getTextField(formData, "timeline"),
                sec1: getTextField(formData, "sec1"),
                sec2: getTextField(formData, "sec2"),
                sec3: getTextField(formData, "sec3"),
                sum: getTextField(formData, "sum"),
                funds: getTextField(formData, "funds"),
            }),
    } as const;

    const parsed = validators[type]();
    const result = parsed.success
        ? null
        : parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";

    return result;
}

function getClientIp(req: Request): string | undefined {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        undefined
    );
}

function getIdempotencyKey(req: Request, formData: FormData): string | null {
    const headerKey =
        req.headers.get("idempotency-key") ??
        req.headers.get("x-idempotency-key");
    if (headerKey) {
        return headerKey;
    }

    const formKey = formData.get("idempotencyKey");
    return typeof formKey === "string" ? formKey : null;
}

async function tryReadJsonBody(
    response: Response,
): Promise<Record<string, unknown> | null> {
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
        return null;
    }

    try {
        const parsed: unknown = await response.clone().json();
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            return null;
        }
        return parsed as Record<string, unknown>;
    } catch {
        return null;
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ type: string }> }
): Promise<NextResponse | Response> {
    let auditUserId: string | null = null;
    let auditUserEmail: string | undefined;
    let auditType: string | null = null;
    let idempotencyRecordId: bigint | null = null;

    try {
        const rateLimitResult = applyRateLimit({
            request: req,
            routeKey: RATE_LIMIT.USER.DOCUMENT_GENERATE.ROUTE_KEY,
            limit: RATE_LIMIT.USER.DOCUMENT_GENERATE.LIMIT,
            windowMs: RATE_LIMIT.USER.DOCUMENT_GENERATE.WINDOW_MS,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่อีกครั้ง",
                    retryAfter: rateLimitResult.retryAfter,
                },
                { status: 429, headers: rateLimitResult.headers },
            );
        }

        const sessionResult = await validateSession();
        if (isSessionError(sessionResult)) {
            return sessionResult;
        }
        const { userId, session } = sessionResult;
        auditUserId = String(userId);
        auditUserEmail = session.user.email ?? undefined;
        const { type } = await params;
        auditType = type;

        if (
            type !== "tor" &&
            type !== "approval" &&
            type !== "contract" &&
            type !== "formproject" &&
            type !== "summary"
        ) {
            return NextResponse.json(
                { error: "ประเภทเอกสารไม่ถูกต้อง" },
                { status: 400, headers: rateLimitResult.headers },
            );
        }

        const formData = await req.formData();
        const validationError = validateDocumentPayload(type, formData);
        if (validationError) {
            return NextResponse.json(
                { error: validationError },
                { status: 400, headers: rateLimitResult.headers },
            );
        }

        const rawIdempotencyKey = getIdempotencyKey(req, formData);
        if (rawIdempotencyKey) {
            const normalizedKey = normalizeIdempotencyKey(rawIdempotencyKey);
            if (!normalizedKey) {
                return NextResponse.json(
                    { error: "Idempotency-Key ไม่ถูกต้อง" },
                    { status: 400, headers: rateLimitResult.headers },
                );
            }

            const idempotency = await startDocumentIdempotency({
                userId,
                documentType: type,
                idempotencyKey: normalizedKey,
            });

            if (idempotency.type === "replay") {
                logAudit("DOCUMENT_GENERATE", auditUserId, {
                    outcome: "success",
                    userEmail: auditUserEmail,
                    ip: getClientIp(req),
                    userAgent: req.headers.get("user-agent") ?? undefined,
                    requestId: req.headers.get("x-request-id") ?? undefined,
                    targetType: "document",
                    details: {
                        documentType: auditType,
                        replayed: true,
                        responseStatus: idempotency.replay.statusCode,
                    },
                });

                return NextResponse.json(idempotency.replay.responseBody, {
                    status: idempotency.replay.statusCode,
                    headers: {
                        ...rateLimitResult.headers,
                        "Idempotent-Replayed": "true",
                    },
                });
            }

            if (idempotency.type === "in_progress") {
                return NextResponse.json(
                    { error: "คำขอนี้กำลังประมวลผลอยู่ กรุณารอสักครู่" },
                    { status: 409, headers: rateLimitResult.headers },
                );
            }

            if (idempotency.type === "failed") {
                return NextResponse.json(
                    {
                        error:
                            "Idempotency-Key นี้เคยล้มเหลวแล้ว กรุณาใช้ key ใหม่เพื่อส่งคำขออีกครั้ง",
                    },
                    { status: 409, headers: rateLimitResult.headers },
                );
            }

            idempotencyRecordId = idempotency.recordId;
        }

        let response: Response;
        switch (type) {
            case "tor":
                response = await handleTorGeneration(formData, userId);
                break;
            case "approval":
                response = await handleApprovalGeneration(formData, userId);
                break;
            case "contract":
                response = await handleContractGeneration(formData, userId);
                break;
            case "formproject":
                response = await handleFormProjectGeneration(formData, userId);
                break;
            case "summary":
                response = await handleSummaryGeneration(formData, userId);
                break;
        }

        const responseBody = await tryReadJsonBody(response);
        if (
            idempotencyRecordId &&
            response.status >= 200 &&
            response.status < 300 &&
            responseBody
        ) {
            await completeDocumentIdempotency({
                recordId: idempotencyRecordId,
                statusCode: response.status,
                responseBody,
            });
        } else if (idempotencyRecordId && !(response.status >= 200 && response.status < 300)) {
            await failDocumentIdempotency({
                recordId: idempotencyRecordId,
                errorMessage: `HTTP_${response.status}`,
            });
        }

        const isSuccess = response.status >= 200 && response.status < 300;
        logAudit("DOCUMENT_GENERATE", auditUserId, {
            outcome: isSuccess ? "success" : "failure",
            userEmail: auditUserEmail,
            ip: getClientIp(req),
            userAgent: req.headers.get("user-agent") ?? undefined,
            requestId: req.headers.get("x-request-id") ?? undefined,
            targetType: "document",
            details: {
                documentType: auditType,
                responseStatus: response.status,
            },
        });

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                ...Object.fromEntries(response.headers.entries()),
                ...rateLimitResult.headers,
            },
        });
    } catch (error) {
        if (idempotencyRecordId) {
            await failDocumentIdempotency({
                recordId: idempotencyRecordId,
                errorMessage:
                    error instanceof Error ? error.message : "unknown_error",
            });
        }

        if (auditUserId) {
            logAudit("DOCUMENT_GENERATE", auditUserId, {
                outcome: "failure",
                userEmail: auditUserEmail,
                ip: getClientIp(req),
                userAgent: req.headers.get("user-agent") ?? undefined,
                requestId: req.headers.get("x-request-id") ?? undefined,
                targetType: "document",
                details: {
                    documentType: auditType,
                    error:
                        error instanceof Error
                            ? error.message
                            : "unknown_error",
                },
            });
        }
        return handleDocumentError(error);
    }
}
