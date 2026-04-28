-- =============================================================
-- clinical-service — careconnect_clinical
-- V1__init.sql
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE doctor_profiles (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          INT UNSIGNED NOT NULL UNIQUE,  -- ref to auth-service users.id
    is_surgeon       BOOLEAN      NOT NULL DEFAULT FALSE,
    specialty        VARCHAR(100),
    license_number   VARCHAR(60)  UNIQUE,
    years_experience TINYINT,
    bio              TEXT,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE operating_rooms (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(20)  NOT NULL UNIQUE,
    status       ENUM('AVAILABLE','IN_USE','CLEANING','MAINTENANCE')
                 NOT NULL DEFAULT 'AVAILABLE',
    last_used_at DATETIME,
    notes        TEXT
);

CREATE TABLE consultations (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT UNSIGNED NOT NULL UNIQUE,  -- ref to appointment-service
    patient_id     INT UNSIGNED NOT NULL,         -- ref to auth-service users.id
    doctor_id      INT UNSIGNED NOT NULL,         -- ref to auth-service users.id
    symptoms       TEXT,
    diagnosis      VARCHAR(255),
    clinical_notes TEXT,
    status         ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
    started_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at      DATETIME
);

CREATE TABLE surgeries (
    id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id           INT UNSIGNED NOT NULL,   -- ref to auth-service users.id
    lead_surgeon_id      INT UNSIGNED NOT NULL,   -- ref to auth-service users.id
    assisting_surgeon_id INT UNSIGNED NULL,       -- ref to auth-service users.id
    assisting_nurse_id   INT UNSIGNED NULL,       -- ref to auth-service users.id
    operating_room_id    INT UNSIGNED NOT NULL,
    admission_id         INT UNSIGNED NULL,       -- ref to patient-service admissions.id
    surgery_type         VARCHAR(150) NOT NULL,
    priority             ENUM('ELECTIVE','URGENT','EMERGENCY')
                         NOT NULL DEFAULT 'ELECTIVE',
    status               ENUM('SCHEDULED','PRE_OP','IN_PROGRESS',
                              'POST_OP','COMPLETED','CANCELLED')
                         NOT NULL DEFAULT 'SCHEDULED',
    scheduled_at         DATETIME NOT NULL,
    estimated_duration   SMALLINT     NOT NULL DEFAULT 60,
    actual_start_at      DATETIME,
    actual_end_at        DATETIME,
    pre_op_notes         TEXT,
    post_op_notes        TEXT,
    outcome              ENUM('SUCCESSFUL','COMPLICATED','REFERRED_TO_ICU') NULL,
    special_equipment    VARCHAR(255),
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_surg_or FOREIGN KEY (operating_room_id)
        REFERENCES operating_rooms(id)
);

CREATE TABLE vitals (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT UNSIGNED NOT NULL,   -- ref to auth-service users.id
    consultation_id INT UNSIGNED NULL,
    admission_id    INT UNSIGNED NULL,       -- ref to patient-service admissions.id
    surgery_id      INT UNSIGNED NULL,       -- ref to surgeries.id
    recorded_by     INT UNSIGNED NOT NULL,   -- ref to auth-service users.id
    bp_systolic     SMALLINT,
    bp_diastolic    SMALLINT,
    heart_rate      SMALLINT,
    temperature     DECIMAL(4,1),
    oxygen_sat      DECIMAL(4,1),
    weight_kg       DECIMAL(5,1),
    height_cm       DECIMAL(5,1),
    notes           TEXT,
    recorded_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vitals_cons    FOREIGN KEY (consultation_id)
        REFERENCES consultations(id) ON DELETE SET NULL,
    CONSTRAINT fk_vitals_surgery FOREIGN KEY (surgery_id)
        REFERENCES surgeries(id) ON DELETE SET NULL
);

CREATE TABLE prescriptions (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    consultation_id INT UNSIGNED NOT NULL,
    patient_id      INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    doctor_id       INT UNSIGNED NOT NULL,  -- ref to auth-service users.id
    issued_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes           TEXT,
    status          ENUM('ACTIVE','EXPIRED','CANCELLED')
                    NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_rx_cons FOREIGN KEY (consultation_id)
        REFERENCES consultations(id)
);

CREATE TABLE prescription_items (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT UNSIGNED NOT NULL,
    medication      VARCHAR(150) NOT NULL,
    dosage          VARCHAR(80)  NOT NULL,
    frequency       VARCHAR(80)  NOT NULL,
    duration_days   SMALLINT     NOT NULL,
    quantity        SMALLINT     NOT NULL,
    instructions    TEXT,
    CONSTRAINT fk_rxi_rx FOREIGN KEY (prescription_id)
        REFERENCES prescriptions(id) ON DELETE CASCADE
);

CREATE TABLE care_tasks (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id   INT UNSIGNED NOT NULL,   -- ref to auth-service users.id
    assigned_to  INT UNSIGNED NOT NULL,   -- ref to auth-service users.id (nurse)
    surgery_id   INT UNSIGNED NULL,
    admission_id INT UNSIGNED NULL,       -- ref to patient-service admissions.id
    title        VARCHAR(150) NOT NULL,
    description  TEXT,
    priority     ENUM('LOW','NORMAL','HIGH','URGENT') NOT NULL DEFAULT 'NORMAL',
    status       ENUM('TODO','IN_PROGRESS','DONE')    NOT NULL DEFAULT 'TODO',
    due_at       DATETIME,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_surgery FOREIGN KEY (surgery_id)
        REFERENCES surgeries(id) ON DELETE SET NULL
);

CREATE TABLE audit_logs (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NULL,   -- ref to auth-service users.id
    action      ENUM('LOGIN','LOGOUT','CREATE','UPDATE',
                     'DELETE','VIEW','EXPORT') NOT NULL,
    module      VARCHAR(80) NOT NULL,
    description TEXT,
    ip_address  VARCHAR(45),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SET FOREIGN_KEY_CHECKS = 1;
