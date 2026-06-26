import { z } from "zod";
import {
    NOTIFICATION_AUDIENCE,
    NOTIFICATION_FEED,
} from "@/lib/notifications/constants";

const positiveBigIntString = z
    .string()
    .regex(/^[1-9]\d*$/, "รหัสการแจ้งเตือนไม่ถูกต้อง");

const notificationAudienceSchema = z.enum([
    NOTIFICATION_AUDIENCE.USER,
    NOTIFICATION_AUDIENCE.ADMIN,
]);

export const notificationListQuerySchema = z.object({
    cursor: positiveBigIntString.optional(),
    limit: z.coerce
        .number()
        .int("จำนวนรายการไม่ถูกต้อง")
        .min(1, "จำนวนรายการไม่ถูกต้อง")
        .max(NOTIFICATION_FEED.MAX_LIMIT, "จำนวนรายการมากเกินไป")
        .default(NOTIFICATION_FEED.DEFAULT_LIMIT),
    unreadOnly: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
    audience: notificationAudienceSchema.optional(),
});

export const notificationAudienceQuerySchema = z.object({
    audience: notificationAudienceSchema.optional(),
});

export const markNotificationsReadSchema = z.object({
    notificationIds: z
        .array(positiveBigIntString)
        .min(1, "กรุณาเลือกการแจ้งเตือน")
        .max(
            NOTIFICATION_FEED.MARK_BATCH_LIMIT,
            "เลือกการแจ้งเตือนมากเกินไป",
        ),
});

export type NotificationListQueryInput = z.infer<
    typeof notificationListQuerySchema
>;
export type NotificationAudienceQueryInput = z.infer<
    typeof notificationAudienceQuerySchema
>;
export type MarkNotificationsReadInput = z.infer<
    typeof markNotificationsReadSchema
>;
