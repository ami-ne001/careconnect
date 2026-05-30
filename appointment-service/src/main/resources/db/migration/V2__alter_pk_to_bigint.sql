-- =============================================================
-- appointment-service — careconnect_appointment
-- V2__alter_pk_to_bigint.sql
-- =============================================================

-- Step 1: Drop foreign key constraint
ALTER TABLE queue DROP FOREIGN KEY fk_queue_appt;

-- Step 2: Alter parent and tables
ALTER TABLE doctor_availability
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN doctor_id BIGINT NOT NULL;

ALTER TABLE doctor_unavailability
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN doctor_id BIGINT NOT NULL;

ALTER TABLE appointments
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN patient_id BIGINT NOT NULL,
    MODIFY COLUMN doctor_id BIGINT NOT NULL,
    MODIFY COLUMN created_by BIGINT;

ALTER TABLE queue
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN appointment_id BIGINT NOT NULL;

-- Step 3: Recreate foreign key constraint
ALTER TABLE queue
    ADD CONSTRAINT fk_queue_appt FOREIGN KEY (appointment_id)
        REFERENCES appointments(id);
