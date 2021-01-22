CREATE DATABASE discord default CHARACTER SET UTF8mb4;
USE `discord`;
CREATE TABLE `chatting`(
    `c_id` INT AUTO_INCREMENT PRIMARY KEY,
    `author_id` VARCHAR(20),
    `author` VARCHAR(20),
    `guild` CHAR(100),
    `channel` CHAR(100),
    `message` TEXT,
    `created_at` DATETIME
) ENGINE = InnoDB default CHARSET = utf8mb4;
CREATE TABLE `answers`(
    `answers_id` INT AUTO_INCREMENT PRIMARY KEY,
    `author_id` VARCHAR(20),
    `author` VARCHAR(20),
    `guild` CHAR(100),
    `channel` CHAR(100),
    `word` TEXT,
    `answer` TEXT,
    `created_at` DATETIME
) ENGINE = InnoDB default CHARSET = utf8mb4;
CREATE TABLE `links`(
    `link_id` INT AUTO_INCREMENT PRIMARY KEY,
    `author_id` VARCHAR(20),
    `author` VARCHAR(20),
    `guild` CHAR(100),
    `channel` CHAR(100),
    `title` VARCHAR(200),
    `description` TEXT,
    `url` VARCHAR(200),
    `created_at` DATETIME
) ENGINE = InnoDB default CHARSET = utf8mb4;
CREATE TABLE `files`(
    `file_id` INT AUTO_INCREMENT PRIMARY KEY,
    `author_id` VARCHAR(20),
    `author` VARCHAR(20),
    `guild` CHAR(100),
    `channel` CHAR(100),
    `name` CHAR(200),
    `extension` CHAR(20),
    `created_at` DATETIME
) ENGINE = InnoDB default CHARSET = utf8mb4;
show tables;
PRINT;
DESC chatting;
PRINT;
DESC answers;
PRINT;
DESC links;
PRINT;
DESC files;
PRINT;