-- Admin responses and project status changes are user-dashboard notifications
-- for both the project owner and assigned co-owners.

INSERT IGNORE INTO `NotificationRecipient` (`eventId`, `recipientUserId`, `audience`)
SELECT `ne`.`id`, `pco`.`adminUserId`, 'user'
FROM `NotificationEvent` AS `ne`
JOIN `ProjectCoOwner` AS `pco` ON `pco`.`projectId` = `ne`.`projectId`
WHERE `ne`.`type` IN ('PROJECT_STATUS_UPDATED', 'PROJECT_REPORT_REVIEWED');
