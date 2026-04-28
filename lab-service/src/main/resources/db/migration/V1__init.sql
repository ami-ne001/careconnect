-- =============================================================
-- lab-service — careconnect_lab
-- V1__init.sql
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE lab_test_types (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL UNIQUE,
    category    VARCHAR(80),
    sample_type VARCHAR(60),
    description TEXT
);

CREATE TABLE lab_test_reference_ranges (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    test_type_id  INT UNSIGNED NOT NULL,
    component     VARCHAR(100) NOT NULL,  -- e.g. "WBC", "Hemoglobin", "LDL"
    unit          VARCHAR(30),            -- e.g. "K/uL", "g/dL", "mg/dL"
    min_value     DECIMAL(10,2),
    max_value     DECIMAL(10,2),
    gender        ENUM('MALE','FEMALE','BOTH') DEFAULT 'BOTH',
    notes         TEXT,
    CONSTRAINT fk_ref_range_test FOREIGN KEY (test_type_id)
        REFERENCES lab_test_types(id) ON DELETE CASCADE
);

CREATE TABLE lab_requests (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    consultation_id INT UNSIGNED NOT NULL,  -- ref to clinical-service consultations.id
    patient_id      INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    doctor_id       INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    test_type_id    INT UNSIGNED NOT NULL,
    priority        ENUM('NORMAL','URGENT','CRITICAL') NOT NULL DEFAULT 'NORMAL',
    status          ENUM('REQUESTED','SAMPLE_RECEIVED',
                         'PROCESSING','COMPLETED','CANCELLED')
                    NOT NULL DEFAULT 'REQUESTED',
    requested_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lr_test_type FOREIGN KEY (test_type_id)
        REFERENCES lab_test_types(id)
);

CREATE TABLE lab_results (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lab_request_id INT UNSIGNED NOT NULL UNIQUE,
    technician_id  INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    result_data    JSON,
    interpretation TEXT,
    uploaded_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_res_request FOREIGN KEY (lab_request_id)
        REFERENCES lab_requests(id)
);

CREATE TABLE equipment (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    type             VARCHAR(80),
    serial_number    VARCHAR(80) UNIQUE,
    status           ENUM('OPERATIONAL','MAINTENANCE','OFFLINE')
                     NOT NULL DEFAULT 'OPERATIONAL',
    last_calibrated  DATE,
    next_calibration DATE,
    notes            TEXT
);

CREATE TABLE equipment_maintenance (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT UNSIGNED NOT NULL,
    reported_by  INT UNSIGNED NULL,  -- ref to auth-service users.id
    issue        TEXT         NOT NULL,
    resolution   TEXT,
    status       ENUM('OPEN','IN_PROGRESS','RESOLVED') NOT NULL DEFAULT 'OPEN',
    reported_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at  DATETIME NULL,
    CONSTRAINT fk_maint_equip FOREIGN KEY (equipment_id)
        REFERENCES equipment(id)
);

SET FOREIGN_KEY_CHECKS = 1;
