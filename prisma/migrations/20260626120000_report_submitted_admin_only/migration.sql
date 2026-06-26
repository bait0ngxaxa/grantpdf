-- Submitted reports always go to the admin review surface.

UPDATE `NotificationEvent`
SET `actionUrl` = CONCAT('/admin?projectId=', `projectId`)
WHERE `type` = 'PROJECT_REPORT_SUBMITTED'
  AND `projectId` IS NOT NULL;

UPDATE `NotificationRecipient` AS `nr`
JOIN `NotificationEvent` AS `ne` ON `ne`.`id` = `nr`.`eventId`
JOIN `User` AS `u` ON `u`.`id` = `nr`.`recipientUserId`
SET `nr`.`audience` = 'admin'
WHERE `ne`.`type` = 'PROJECT_REPORT_SUBMITTED'
  AND `u`.`role` = 'admin';

DELETE `nr`
FROM `NotificationRecipient` AS `nr`
JOIN `NotificationEvent` AS `ne` ON `ne`.`id` = `nr`.`eventId`
JOIN `User` AS `u` ON `u`.`id` = `nr`.`recipientUserId`
WHERE `ne`.`type` = 'PROJECT_REPORT_SUBMITTED'
  AND `u`.`role` <> 'admin';

INSERT IGNORE INTO `NotificationRecipient` (`eventId`, `recipientUserId`, `audience`)
SELECT `ne`.`id`, `u`.`id`, 'admin'
FROM `NotificationEvent` AS `ne`
JOIN `User` AS `u` ON `u`.`role` = 'admin'
WHERE `ne`.`type` = 'PROJECT_REPORT_SUBMITTED';
