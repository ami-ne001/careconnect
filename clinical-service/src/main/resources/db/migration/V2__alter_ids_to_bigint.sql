-- =============================================================
-- clinical-service — careconnect_clinical
-- V2__alter_ids_to_bigint.sql
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Drop foreign key constraints
ALTER TABLE surgeries DROP FOREIGN KEY fk_surg_or;
ALTER TABLE vitals DROP FOREIGN KEY fk_vitals_cons;
ALTER TABLE vitals DROP FOREIGN KEY fk_vitals_surgery;
ALTER TABLE prescriptions DROP FOREIGN KEY fk_rx_cons;
ALTER TABLE prescription_items DROP FOREIGN KEY fk_rxi_rx;
ALTER TABLE care_tasks DROP FOREIGN KEY fk_task_surgery;

-- Step 2: Modify columns to BIGINT to match JPA's Long types
ALTER TABLE doctor_profiles 
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT, 
    MODIFY COLUMN user_id BIGINT NOT NULL;

ALTER TABLE operating_rooms 
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

ALTER TABLE consultations 
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT, 
    MODIFY COLUMN appointment_id BIGINT NOT NULL, 
    MODIFY COLUMN patient_id BIGINT NOT NULL, 
    MODIFY COLUMN doctor_id BIGINT NOT NULL;

ALTER TABLE surgeries 
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT, 
    MODIFY COLUMN patient_id BIGINT NOT NULL, 
    MODIFY COLUMN lead_surgeon_id BIGINT NOT NULL, 
    MODIFY COLUMN assisting_surgeon_id BIGINT NULL, 
    MODIFY COLUMN assisting_nurse_id BIGINT NULL, 
    MODIFY COLUMN operating_room_id BIGINT NOT NULL, 
    MODIFY COLUMN admission_id BIGINT NULL;

ALTER TABLE vitals 
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT, 
    MODIFY COLUMN patient_id BIGINT NOT NULL, 
    MODIFY COLUMN consultation_id BIGINT NULL, 
    MODIFY COLUMN admission_id BIGINT NULL, 
    MODIFY COLUMN surgery_id BIGINT NULL, 
    MODIFY COLUMN recorded_by BIGINT NOT NULL;

ALTER TABLE prescriptions 
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT, 
    MODIFY COLUMN consultation_id BIGINT NOT NULL, 
    MODIFY COLUMN patient_id BIGINT NOT NULL, 
    MODIFY COLUMN doctor_id BIGINT NOT NULL;

ALTER TABLE prescription_items 
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT, 
    MODIFY COLUMN prescription_id BIGINT NOT NULL;

ALTER TABLE care_tasks 
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT, 
    MODIFY COLUMN patient_id BIGINT NOT NULL, 
    MODIFY COLUMN assigned_to BIGINT NOT NULL, 
    MODIFY COLUMN surgery_id BIGINT NULL, 
    MODIFY COLUMN admission_id BIGINT NULL;

ALTER TABLE audit_logs 
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT, 
    MODIFY COLUMN user_id BIGINT NULL;

-- Step 3: Recreate foreign key constraints
ALTER TABLE surgeries ADD CONSTRAINT fk_surg_or FOREIGN KEY (operating_room_id) REFERENCES operating_rooms(id);
ALTER TABLE vitals ADD CONSTRAINT fk_vitals_cons FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL;
ALTER TABLE vitals ADD CONSTRAINT fk_vitals_surgery FOREIGN KEY (surgery_id) REFERENCES surgeries(id) ON DELETE SET NULL;
ALTER TABLE prescriptions ADD CONSTRAINT fk_rx_cons FOREIGN KEY (consultation_id) REFERENCES consultations(id);
ALTER TABLE prescription_items ADD CONSTRAINT fk_rxi_rx FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE;
ALTER TABLE care_tasks ADD CONSTRAINT fk_task_surgery FOREIGN KEY (surgery_id) REFERENCES surgeries(id) ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;
