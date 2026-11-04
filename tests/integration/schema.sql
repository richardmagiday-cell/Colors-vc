-- Test database for the integration tests (used by CI only).
-- Mirrors the schema the PHP API expects, plus one seeded test user.

CREATE DATABASE IF NOT EXISTS COP4331;
USE COP4331;

CREATE TABLE Users
(
	ID INT NOT NULL AUTO_INCREMENT,
	DateCreated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	DateLastLoggedIn DATETIME NULL DEFAULT NULL,
	FirstName VARCHAR(50) NOT NULL DEFAULT '',
	LastName VARCHAR(50) NOT NULL DEFAULT '',
	Login VARCHAR(50) NOT NULL DEFAULT '',
	Password VARCHAR(50) NOT NULL DEFAULT '',
	PRIMARY KEY (ID)
) ENGINE = InnoDB;

CREATE TABLE Colors
(
	ID INT NOT NULL AUTO_INCREMENT,
	Name VARCHAR(50) NOT NULL DEFAULT '',
	UserID INT NOT NULL DEFAULT 0,
	PRIMARY KEY (ID)
) ENGINE = InnoDB;

-- Passwords are stored as MD5 hashes, matching what code.js sends
INSERT INTO Users (FirstName, LastName, Login, Password)
VALUES ('Test', 'User', 'testuser', MD5('testpass'));

INSERT INTO Colors (Name, UserID)
VALUES ('Blue', 1), ('Light Blue', 1), ('Red', 1);
