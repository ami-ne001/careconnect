-- =============================================================
-- auth-service — careconnect_auth
-- V1__init.sql
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE departments (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(60)  NOT NULL,
    last_name     VARCHAR(60)  NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('ADMIN','DOCTOR','NURSE','RECEPTIONIST',
                       'PATIENT','LAB_TECHNICIAN') NOT NULL,
    department_id INT UNSIGNED NULL,
    phone         VARCHAR(20),
    gender        ENUM('MALE','FEMALE','OTHER'),
    date_of_birth DATE,
    address       VARCHAR(255),
    is_active     BOOLEAN  NOT NULL DEFAULT TRUE,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_dept FOREIGN KEY (department_id)
        REFERENCES departments(id) ON DELETE SET NULL
);

SET FOREIGN_KEY_CHECKS = 1;
