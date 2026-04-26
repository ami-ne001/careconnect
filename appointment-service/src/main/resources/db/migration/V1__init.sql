-- =============================================================
-- appointment-service — careconnect_appointment
-- V1__init.sql
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE appointments (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id       INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    doctor_id        INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    scheduled_at     DATETIME     NOT NULL,
    duration_minutes SMALLINT     NOT NULL DEFAULT 30,
    type             ENUM('GENERAL_CHECKUP','FOLLOW_UP',
                          'EMERGENCY','PROCEDURE','CONSULTATION') NOT NULL,
    room             VARCHAR(20),
    status           ENUM('SCHEDULED','CONFIRMED','CHECKED_IN',
                          'IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW')
                     NOT NULL DEFAULT 'SCHEDULED',
    notes            TEXT,
    created_by       INT UNSIGNED NULL,      -- ref to auth-service users.id
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE queue (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT UNSIGNED NOT NULL UNIQUE,
    ticket_number  SMALLINT     NOT NULL,
    checked_in_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    called_at      DATETIME,
    status         ENUM('WAITING','CALLED','IN_ROOM','DONE','NO_SHOW')
                   NOT NULL DEFAULT 'WAITING',
    CONSTRAINT fk_queue_appt FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
);

SET FOREIGN_KEY_CHECKS = 1;
