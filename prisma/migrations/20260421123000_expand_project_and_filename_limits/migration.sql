-- AlterTable
ALTER TABLE `Project`
MODIFY `name` VARCHAR(255) NOT NULL,
MODIFY `statusNote` TEXT NULL;

-- AlterTable
ALTER TABLE `UserFile`
MODIFY `originalFileName` VARCHAR(255) NOT NULL;
