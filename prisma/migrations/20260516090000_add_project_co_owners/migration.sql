ALTER TABLE `Project`
    ADD COLUMN `allowCoOwners` BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE `ProjectCoOwner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `adminUserId` INTEGER NOT NULL,
    `assignedById` INTEGER NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `ProjectCoOwner_projectId_adminUserId_key`(`projectId`, `adminUserId`),
    INDEX `ProjectCoOwner_projectId_idx`(`projectId`),
    INDEX `ProjectCoOwner_adminUserId_idx`(`adminUserId`),
    INDEX `ProjectCoOwner_assignedById_idx`(`assignedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ProjectCoOwner`
    ADD CONSTRAINT `ProjectCoOwner_projectId_fkey`
    FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProjectCoOwner`
    ADD CONSTRAINT `ProjectCoOwner_adminUserId_fkey`
    FOREIGN KEY (`adminUserId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProjectCoOwner`
    ADD CONSTRAINT `ProjectCoOwner_assignedById_fkey`
    FOREIGN KEY (`assignedById`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
