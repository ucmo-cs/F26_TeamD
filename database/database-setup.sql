


-- 1. Install MySQL Server and MySQL Workbench.
-- 2. Open MySQL Workbench and connect to your local server.
-- 3. Open this SQL file.
-- 4. Refresh Schemas and verify loan_repayment_tracker exists.
-- 5. Run this script only once not (twice) ;(.


CREATE DATABASE IF NOT EXISTS loan_repayment_tracker;

USE loan_repayment_tracker;

CREATE TABLE `customers` (
    `customer_id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `email` varchar(150) NOT NULL,
    `phone` varchar(20) DEFAULT NULL,
    `password` varchar(255) NOT NULL,
    PRIMARY KEY (`customer_id`),
    UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `admin` (
  `Admin_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`Admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `loan` (
  `loan_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `loan_date` date NOT NULL,
  `original_amount` decimal(12,2) NOT NULL,
  `remaining_balance` decimal(12,2) NOT NULL,
  `interest_rate` decimal(5,4) NOT NULL,
  PRIMARY KEY (`loan_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `loan_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `bank_account` (
  `account_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `routing_number` varchar(20) DEFAULT NULL,
  `account_number` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `customer_id` (`customer_id`),
  CONSTRAINT `bank_account_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `payment_schedule` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `loan_id` int NOT NULL,
  `frequency` varchar(20) NOT NULL,
  `payment_amount` decimal(12,2) NOT NULL,
  `next_payment_date` date DEFAULT NULL,
  PRIMARY KEY (`schedule_id`),
  UNIQUE KEY `loan_id` (`loan_id`),
  CONSTRAINT `payment_schedule_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loan` (`loan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

