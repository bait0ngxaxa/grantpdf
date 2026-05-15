-- CreateTable
CREATE TABLE `ProjectReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportType` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'รอตรวจสอบ',
    `note` TEXT NULL,
    `adminNote` TEXT NULL,
    `submittedAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `reviewedAt` TIMESTAMP(6) NULL,
    `reviewedBy` INTEGER NULL,
    `userId` INTEGER NOT NULL,
    `projectId` INTEGER NOT NULL,
    `fileId` INTEGER NOT NULL,

    INDEX `ProjectReport_projectId_submittedAt_idx`(`projectId`, `submittedAt`),
    INDEX `ProjectReport_userId_submittedAt_idx`(`userId`, `submittedAt`),
    INDEX `ProjectReport_status_submittedAt_idx`(`status`, `submittedAt`),
    INDEX `ProjectReport_fileId_idx`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProjectReport`
    ADD CONSTRAINT `ProjectReport_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectReport`
    ADD CONSTRAINT `ProjectReport_projectId_fkey`
    FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectReport`
    ADD CONSTRAINT `ProjectReport_fileId_fkey`
    FOREIGN KEY (`fileId`) REFERENCES `UserFile`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
