UPDATE `User`
SET `email` = CONCAT(
    'deleted+',
    `id`,
    '-',
    REPLACE(UUID(), '-', ''),
    '@deleted.invalid'
)
WHERE `status` = 'deleted'
  AND `deleted_at` IS NOT NULL
  AND `email` NOT LIKE 'deleted+%@deleted.invalid';

CREATE INDEX `User_status_purge_after_idx`
    ON `User`(`status`, `purge_after`);
