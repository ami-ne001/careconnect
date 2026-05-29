-- =============================================================
-- patient-service — careconnect_patient
-- V2__alter_pk_to_bigint.sql
-- =============================================================

-- Step 1: Drop all FK constraints that reference columns we need to alter
ALTER TABLE rooms              DROP FOREIGN KEY fk_room_ward;
ALTER TABLE allergies          DROP FOREIGN KEY fk_allergy_patient;
ALTER TABLE chronic_conditions DROP FOREIGN KEY fk_cc_patient;
ALTER TABLE admissions         DROP FOREIGN KEY fk_adm_room;

-- Step 2: Alter parent tables first (referenced tables)
ALTER TABLE wards
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN floor INT;

ALTER TABLE patient_profiles
    MODIFY COLUMN id      BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN user_id BIGINT NOT NULL;

-- Step 3: Alter child/dependent tables
ALTER TABLE rooms
    MODIFY COLUMN id      BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN ward_id BIGINT NOT NULL,
    MODIFY COLUMN bed_count INT NOT NULL DEFAULT 1;

ALTER TABLE allergies
    MODIFY COLUMN id         BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN patient_id BIGINT NOT NULL;

ALTER TABLE chronic_conditions
    MODIFY COLUMN id         BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN patient_id BIGINT NOT NULL;

ALTER TABLE admissions
    MODIFY COLUMN id                  BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN patient_id          BIGINT NOT NULL,
    MODIFY COLUMN admitting_doctor_id BIGINT NOT NULL,
    MODIFY COLUMN room_id             BIGINT NOT NULL,
    MODIFY COLUMN bed_number          INT NOT NULL DEFAULT 1,
    MODIFY COLUMN created_by          BIGINT NULL;

ALTER TABLE medical_documents
    MODIFY COLUMN id          BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN patient_id  BIGINT NOT NULL,
    MODIFY COLUMN uploaded_by BIGINT NOT NULL;

ALTER TABLE notifications
    MODIFY COLUMN id      BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN user_id BIGINT NOT NULL;

-- Step 4: Recreate FK constraints
ALTER TABLE rooms
    ADD CONSTRAINT fk_room_ward
        FOREIGN KEY (ward_id) REFERENCES wards(id);

ALTER TABLE allergies
    ADD CONSTRAINT fk_allergy_patient
        FOREIGN KEY (patient_id) REFERENCES patient_profiles(id) ON DELETE CASCADE;

ALTER TABLE chronic_conditions
    ADD CONSTRAINT fk_cc_patient
        FOREIGN KEY (patient_id) REFERENCES patient_profiles(id) ON DELETE CASCADE;

ALTER TABLE admissions
    ADD CONSTRAINT fk_adm_room
        FOREIGN KEY (room_id) REFERENCES rooms(id);

