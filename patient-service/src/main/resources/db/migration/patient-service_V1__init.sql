-- =============================================================
-- patient-service — careconnect_patient
-- V1__init.sql
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE wards (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    floor       TINYINT,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ward_id     INT UNSIGNED NOT NULL,
    room_number VARCHAR(20)  NOT NULL UNIQUE,
    bed_count   TINYINT      NOT NULL DEFAULT 1,
    status      ENUM('AVAILABLE','OCCUPIED','MAINTENANCE')
                NOT NULL DEFAULT 'AVAILABLE',
    notes       TEXT,
    CONSTRAINT fk_room_ward FOREIGN KEY (ward_id)
        REFERENCES wards(id)
);

CREATE TABLE patient_profiles (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id                 INT UNSIGNED NOT NULL UNIQUE,  -- ref to auth-service users.id
    blood_type              ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
    national_id             VARCHAR(50)  UNIQUE,
    insurance_provider      VARCHAR(100),
    insurance_number        VARCHAR(80),
    emergency_contact_name  VARCHAR(120),
    emergency_contact_phone VARCHAR(20)
);

CREATE TABLE allergies (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id  INT UNSIGNED NOT NULL,
    allergen    VARCHAR(100) NOT NULL,
    severity    ENUM('MILD','MODERATE','SEVERE') NOT NULL DEFAULT 'MODERATE',
    notes       TEXT,
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_allergy_patient FOREIGN KEY (patient_id)
        REFERENCES patient_profiles(id) ON DELETE CASCADE
);

CREATE TABLE chronic_conditions (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id     INT UNSIGNED NOT NULL,
    condition_name VARCHAR(150) NOT NULL,
    diagnosed      DATE,
    notes          TEXT,
    CONSTRAINT fk_cc_patient FOREIGN KEY (patient_id)
        REFERENCES patient_profiles(id) ON DELETE CASCADE
);

CREATE TABLE admissions (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id              INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    admitting_doctor_id     INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    room_id                 INT UNSIGNED NOT NULL,
    bed_number              TINYINT      NOT NULL DEFAULT 1,
    admission_date          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_discharge_date DATE,
    actual_discharge_date   DATETIME,
    admission_reason        TEXT,
    diagnosis               VARCHAR(255),
    status                  ENUM('ADMITTED','DISCHARGING','DISCHARGED')
                            NOT NULL DEFAULT 'ADMITTED',
    discharge_status        ENUM('RECOVERED','AGAINST_MEDICAL_ADVICE',
                                 'TRANSFERRED','DECEASED') NULL,
    condition_on_discharge  ENUM('STABLE','IMPROVED','UNCHANGED','CRITICAL') NULL,
    discharge_notes         TEXT,
    follow_up_instructions  TEXT,
    created_by              INT UNSIGNED NULL,      -- ref to auth-service users.id
    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_adm_room FOREIGN KEY (room_id)
        REFERENCES rooms(id)
);

CREATE TABLE medical_documents (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id    INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    uploaded_by   INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    document_type ENUM('LAB_REPORT','IMAGING','DISCHARGE_SUMMARY',
                       'REFERRAL','PRESCRIPTION','SURGERY_REPORT','OTHER') NOT NULL,
    file_name     VARCHAR(255) NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    description   TEXT,
    uploaded_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    type       ENUM('APPOINTMENT_REMINDER','LAB_RESULT_READY',
                    'SURGERY_SCHEDULED','SURGERY_UPDATE',
                    'PATIENT_ADMITTED','PATIENT_DISCHARGED',
                    'PAYMENT_DUE','SYSTEM','GENERAL') NOT NULL,
    title      VARCHAR(150) NOT NULL,
    message    TEXT         NOT NULL,
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SET FOREIGN_KEY_CHECKS = 1;
