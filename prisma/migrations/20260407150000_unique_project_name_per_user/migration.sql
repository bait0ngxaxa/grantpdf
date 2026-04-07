ALTER TABLE `Project`
ADD CONSTRAINT `Project_userId_name_key` UNIQUE (`userId`, `name`);
