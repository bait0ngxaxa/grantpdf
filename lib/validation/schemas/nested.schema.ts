import { z } from "zod";
import {
    DOCUMENT_NESTED_ITEM_MAX_COUNT,
    DOCUMENT_NESTED_PAYLOAD_MAX_BYTES,
    DOCUMENT_NESTED_STRING_MAX_LENGTH,
} from "../constants";

function getSerializedByteLength(value: unknown): number {
    const serialized = JSON.stringify(value);
    return serialized ? new TextEncoder().encode(serialized).byteLength : 0;
}

function addSerializedSizeIssue(
    value: unknown,
    label: string,
    ctx: z.RefinementCtx,
): void {
    if (getSerializedByteLength(value) > DOCUMENT_NESTED_PAYLOAD_MAX_BYTES) {
        ctx.addIssue({
            code: "custom",
            message: `${label}มีขนาดใหญ่เกินไป`,
        });
    }
}

function normalizeOptionalJsonInput(input: unknown): unknown {
    return input === null || input === undefined || input === "" ? "[]" : input;
}

function addDuplicateIdIssue(value: number[], ctx: z.RefinementCtx): void {
    if (new Set(value).size !== value.length) {
        ctx.addIssue({
            code: "custom",
            message: "รายการรหัสไฟล์แนบซ้ำกัน",
        });
    }
}

function createJsonArraySchema<T extends z.ZodType>(
    itemSchema: T,
    label: string,
): z.ZodType<z.infer<T>[]> {
    const arraySchema = z
        .array(itemSchema, { error: `${label}ต้องเป็นรายการ` })
        .max(DOCUMENT_NESTED_ITEM_MAX_COUNT, {
            message: `${label}มีจำนวนรายการมากเกินไป`,
        })
        .superRefine((value, ctx) => {
            addSerializedSizeIssue(value, label, ctx);
        });

    const jsonStringSchema = z
        .string(`${label}ต้องเป็น JSON array`)
        .superRefine((value, ctx) => {
            if (
                new TextEncoder().encode(value).byteLength >
                DOCUMENT_NESTED_PAYLOAD_MAX_BYTES
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: `${label}มีขนาดใหญ่เกินไป`,
                });
            }
        })
        .transform((value, ctx): unknown => {
            try {
                return JSON.parse(value) as unknown;
            } catch {
                ctx.addIssue({
                    code: "custom",
                    message: `${label}ไม่ถูกต้อง`,
                });
                return z.NEVER;
            }
        });

    return z.preprocess(
        normalizeOptionalJsonInput,
        jsonStringSchema.pipe(arraySchema),
    );
}

const nestedStringSchema = z
    .string()
    .max(DOCUMENT_NESTED_STRING_MAX_LENGTH, {
        message: "ข้อความยาวเกินไป",
    });

export const activitySchema = z
    .object({
        activity: nestedStringSchema,
        manager: nestedStringSchema,
        evaluation2: nestedStringSchema,
        duration: nestedStringSchema,
    })
    .strict();

export type ActivityData = z.infer<typeof activitySchema>;

export const activitiesSchema = z
    .array(activitySchema)
    .max(DOCUMENT_NESTED_ITEM_MAX_COUNT, {
        message: "ข้อมูลกิจกรรมมีจำนวนรายการมากเกินไป",
    })
    .superRefine((value, ctx) => {
        addSerializedSizeIssue(value, "ข้อมูลกิจกรรม", ctx);
    });

export const activitiesJsonSchema: z.ZodType<
    z.infer<typeof activitiesSchema>
> = createJsonArraySchema(activitySchema, "ข้อมูลกิจกรรม");

export const attachmentTextSchema = z
    .string()
    .max(DOCUMENT_NESTED_STRING_MAX_LENGTH, {
        message: "ข้อความไฟล์แนบยาวเกินไป",
    });

export const attachmentsSchema = z
    .array(attachmentTextSchema)
    .max(DOCUMENT_NESTED_ITEM_MAX_COUNT, {
        message: "รายการไฟล์แนบมีจำนวนรายการมากเกินไป",
    })
    .superRefine((value, ctx) => {
        addSerializedSizeIssue(value, "รายการไฟล์แนบ", ctx);
    });

export const attachmentsJsonSchema: z.ZodType<
    z.infer<typeof attachmentsSchema>
> = createJsonArraySchema(attachmentTextSchema, "รายการไฟล์แนบ");

const attachmentFileIdSchema = z.union([
    z.number().int().positive().safe(),
    z
        .string()
        .regex(/^[1-9]\d*$/, {
            message: "รหัสไฟล์แนบไม่ถูกต้อง",
        })
        .transform((value) => Number(value))
        .refine(Number.isSafeInteger, {
            message: "รหัสไฟล์แนบไม่ถูกต้อง",
        }),
]);

export const attachmentFileIdsSchema = z
    .array(attachmentFileIdSchema)
    .max(DOCUMENT_NESTED_ITEM_MAX_COUNT, {
        message: "รายการรหัสไฟล์แนบมีจำนวนรายการมากเกินไป",
    })
    .superRefine((value, ctx) => {
        addSerializedSizeIssue(value, "รายการรหัสไฟล์แนบ", ctx);
        addDuplicateIdIssue(value, ctx);
    });

export const attachmentFileIdsJsonSchema: z.ZodType<
    z.infer<typeof attachmentFileIdsSchema>
> = createJsonArraySchema(
    attachmentFileIdSchema,
    "รายการรหัสไฟล์แนบ",
).superRefine((value, ctx) => {
    addDuplicateIdIssue(value, ctx);
});
