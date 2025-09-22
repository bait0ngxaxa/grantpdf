-- CreateTable
CREATE TABLE `AttachmentFile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `userFileId` INTEGER NOT NULL,

    INDEX `AttachmentFile_userFileId_idx`(`userFileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AttachmentFile` ADD CONSTRAINT `AttachmentFile_userFileId_fkey` FOREIGN KEY (`userFileId`) REFERENCES `UserFile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
