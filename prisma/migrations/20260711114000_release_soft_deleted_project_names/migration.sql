-- A soft-deleted project must no longer reserve its owner's active project name.
-- Keep the original record and its relations intact while making its old name reusable.
UPDATE `Project`
SET `name` = CONCAT(
    LEFT(`name`, 255 - CHAR_LENGTH(CONCAT('__deleted_', `id`))),
    '__deleted_',
    `id`
)
WHERE `deleted_at` IS NOT NULL;
