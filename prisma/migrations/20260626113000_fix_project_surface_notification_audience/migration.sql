-- Co-owner project work belongs to the user dashboard surface, even when the
-- assigned person also has an admin role.

UPDATE `NotificationRecipient` AS `nr`
JOIN `NotificationEvent` AS `ne` ON `ne`.`id` = `nr`.`eventId`
SET `nr`.`audience` = 'user'
WHERE `ne`.`type` = 'PROJECT_CO_OWNER_ASSIGNED';

UPDATE `NotificationEvent`
SET `actionUrl` = CONCAT('/userdashboard?projectId=', `projectId`)
WHERE `type` = 'PROJECT_CO_OWNER_ASSIGNED'
  AND `projectId` IS NOT NULL;

UPDATE `NotificationRecipient` AS `nr`
JOIN `NotificationEvent` AS `ne` ON `ne`.`id` = `nr`.`eventId`
JOIN `ProjectCoOwner` AS `pco`
  ON `pco`.`projectId` = `ne`.`projectId`
 AND `pco`.`adminUserId` = `nr`.`recipientUserId`
SET `nr`.`audience` = 'user'
WHERE `ne`.`type` = 'PROJECT_REPORT_SUBMITTED';

UPDATE `NotificationEvent` AS `ne`
SET `ne`.`actionUrl` = CONCAT('/userdashboard?projectId=', `ne`.`projectId`)
WHERE `ne`.`type` = 'PROJECT_REPORT_SUBMITTED'
  AND `ne`.`projectId` IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM `NotificationRecipient` AS `nr`
    JOIN `ProjectCoOwner` AS `pco`
      ON `pco`.`projectId` = `ne`.`projectId`
     AND `pco`.`adminUserId` = `nr`.`recipientUserId`
    WHERE `nr`.`eventId` = `ne`.`id`
  );
