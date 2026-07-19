UPDATE `audit_logs`
SET `details` = JSON_SET(
    `details`,
    '$.coOwnerUserIds',
    JSON_EXTRACT(`details`, '$.adminUserIds')
)
WHERE `action` = 'ADMIN_PROJECT_CO_OWNER_UPDATE'
  AND JSON_CONTAINS_PATH(`details`, 'one', '$.adminUserIds')
  AND NOT JSON_CONTAINS_PATH(`details`, 'one', '$.coOwnerUserIds');

ALTER TABLE `ProjectCoOwner`
    DROP FOREIGN KEY `ProjectCoOwner_adminUserId_fkey`,
    DROP INDEX `ProjectCoOwner_projectId_adminUserId_key`,
    DROP INDEX `ProjectCoOwner_adminUserId_idx`,
    CHANGE COLUMN `adminUserId` `coOwnerUserId` INTEGER NOT NULL,
    ADD UNIQUE INDEX `ProjectCoOwner_projectId_coOwnerUserId_key`(`projectId`, `coOwnerUserId`),
    ADD INDEX `ProjectCoOwner_coOwnerUserId_idx`(`coOwnerUserId`),
    ADD CONSTRAINT `ProjectCoOwner_coOwnerUserId_fkey`
    FOREIGN KEY (`coOwnerUserId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
