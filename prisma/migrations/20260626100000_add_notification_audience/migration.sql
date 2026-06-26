ALTER TABLE `NotificationRecipient`
    ADD COLUMN `audience` VARCHAR(16) NOT NULL DEFAULT 'user';

UPDATE `NotificationRecipient` nr
INNER JOIN `NotificationEvent` ne ON ne.`id` = nr.`eventId`
SET nr.`audience` = 'admin'
WHERE ne.`type` IN (
    'PROJECT_CREATED',
    'PROJECT_REPORT_SUBMITTED',
    'PROJECT_CO_OWNER_ASSIGNED'
);

UPDATE `NotificationRecipient` nr
INNER JOIN `NotificationEvent` ne ON ne.`id` = nr.`eventId`
SET nr.`audience` = 'user'
WHERE ne.`type` IN (
    'PROJECT_STATUS_UPDATED',
    'PROJECT_REPORT_REVIEWED'
);

CREATE INDEX `NotifRec_user_aud_read_created_idx`
    ON `NotificationRecipient`(`recipientUserId`, `audience`, `readAt`, `created_at`);

CREATE INDEX `NotifRec_user_aud_arch_created_idx`
    ON `NotificationRecipient`(`recipientUserId`, `audience`, `archivedAt`, `created_at`);
