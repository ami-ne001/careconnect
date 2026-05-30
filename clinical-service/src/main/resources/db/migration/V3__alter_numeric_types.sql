-- =============================================================
-- clinical-service — careconnect_clinical
-- V3__alter_numeric_types.sql
-- =============================================================

-- Promote TINYINT/SMALLINT columns to INT to match Java's Integer type and prevent Hibernate validation failures.
ALTER TABLE doctor_profiles MODIFY COLUMN years_experience INT;

ALTER TABLE surgeries MODIFY COLUMN estimated_duration INT NOT NULL DEFAULT 60;

ALTER TABLE vitals
    MODIFY COLUMN bp_systolic INT,
    MODIFY COLUMN bp_diastolic INT,
    MODIFY COLUMN heart_rate INT;

ALTER TABLE prescription_items
    MODIFY COLUMN duration_days INT NOT NULL,
    MODIFY COLUMN quantity INT NOT NULL;
