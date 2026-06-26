-- CreateTable
CREATE TABLE `NotificationEvent` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(64) NOT NULL,
    `actorUserId` INTEGER NULL,
    `projectId` INTEGER NULL,
    `projectReportId` INTEGER NULL,
    `title` VARCHAR(160) NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `actionUrl` VARCHAR(300) NULL,
    `metadata` JSON NULL,
    `dedupeKey` VARCHAR(191) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `NotificationEvent_dedupeKey_key`(`dedupeKey`),
    INDEX `NotificationEvent_type_created_at_idx`(`type`, `created_at`),
    INDEX `NotificationEvent_projectId_created_at_idx`(`projectId`, `created_at`),
    INDEX `NotificationEvent_projectReportId_created_at_idx`(`projectReportId`, `created_at`),
    INDEX `NotificationEvent_actorUserId_created_at_idx`(`actorUserId`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationRecipient` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `eventId` BIGINT NOT NULL,
    `recipientUserId` INTEGER NOT NULL,
    `seenAt` TIMESTAMP(6) NULL,
    `readAt` TIMESTAMP(6) NULL,
    `archivedAt` TIMESTAMP(6) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `NotificationRecipient_eventId_recipientUserId_key`(`eventId`, `recipientUserId`),
    INDEX `NotificationRecipient_recipientUserId_readAt_created_at_idx`(`recipientUserId`, `readAt`, `created_at`),
    INDEX `NotificationRecipient_recipientUserId_archivedAt_created_at_idx`(`recipientUserId`, `archivedAt`, `created_at`),
    INDEX `NotificationRecipient_eventId_idx`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NotificationEvent`
    ADD CONSTRAINT `NotificationEvent_actorUserId_fkey`
    FOREIGN KEY (`actorUserId`) REFERENCES `User`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationEvent`
    ADD CONSTRAINT `NotificationEvent_projectId_fkey`
    FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationEvent`
    ADD CONSTRAINT `NotificationEvent_projectReportId_fkey`
    FOREIGN KEY (`projectReportId`) REFERENCES `ProjectReport`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationRecipient`
    ADD CONSTRAINT `NotificationRecipient_eventId_fkey`
    FOREIGN KEY (`eventId`) REFERENCES `NotificationEvent`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationRecipient`
    ADD CONSTRAINT `NotificationRecipient_recipientUserId_fkey`
    FOREIGN KEY (`recipientUserId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
