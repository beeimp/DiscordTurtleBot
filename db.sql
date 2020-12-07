CREATE DATABASE discord default CHARACTER SET UTF8mb4;
USE `discord`;
CREATE TABLE `chatting`(
    `c_id`        INT         AUTO_INCREMENT PRIMARY KEY,
    `author`      CHAR(20),
    `message`     TEXT,
    `create_at`   DATETIME
) ENGINE=InnoDB default CHARSET=utf8mb4;
CREATE TABLE `answers`(
    `answers_id`    INT         AUTO_INCREMENT PRIMARY KEY,
    `author`        CHAR(20),
    `word`          CHAR(200),
    `answer`        CHAR(200),
    `create_at`     DATETIME
) ENGINE=InnoDB default CHARSET=utf8mb4;

show tables;
PRINT;
DESC chatting;
PRINT;
DESC answers;
PRINT;
