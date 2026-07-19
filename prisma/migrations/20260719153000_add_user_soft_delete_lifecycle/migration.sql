ALTER TABLE `User`
    ADD COLUMN `deleted_at` TIMESTAMP(6) NULL,
    ADD COLUMN `deleted_by_id` INTEGER NULL,
    ADD COLUMN `status` VARCHAR(16) NOT NULL DEFAULT 'active',
    ADD COLUMN `purge_after` TIMESTAMP(6) NULL,
    ADD INDEX `User_status_deleted_at_idx`(`status`, `deleted_at`),
    ADD CONSTRAINT `User_deleted_by_id_fkey`
        FOREIGN KEY (`deleted_by_id`) REFERENCES `User`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `ProjectCoOwner`
    DROP FOREIGN KEY `ProjectCoOwner_assignedById_fkey`;

ALTER TABLE `ProjectCoOwner`
    MODIFY COLUMN `assignedById` INTEGER NULL;

ALTER TABLE `ProjectCoOwner`
    ADD CONSTRAINT `ProjectCoOwner_assignedById_fkey`
        FOREIGN KEY (`assignedById`) REFERENCES `User`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE;
