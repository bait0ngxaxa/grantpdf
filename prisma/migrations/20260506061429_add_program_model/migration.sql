-- AlterTable
ALTER TABLE `Project` ADD COLUMN `programId` INTEGER NULL;

-- AlterTable
ALTER TABLE `document_idempotency` ALTER COLUMN `updated_at` DROP DEFAULT;

-- CreateTable
CREATE TABLE `Program` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `Program_name_key`(`name`),
    INDEX `Program_sortOrder_idx`(`sortOrder`),
    INDEX `Program_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Project_programId_idx` ON `Project`(`programId`);

-- CreateIndex
CREATE INDEX `Project_programId_created_at_idx` ON `Project`(`programId`, `created_at`);

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
