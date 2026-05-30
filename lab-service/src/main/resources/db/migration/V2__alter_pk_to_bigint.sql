-- =============================================================
-- lab-service — careconnect_lab
-- V2__alter_pk_to_bigint.sql
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Drop all FK constraints that reference columns we need to alter
ALTER TABLE lab_test_reference_ranges DROP FOREIGN KEY fk_ref_range_test;
ALTER TABLE lab_requests              DROP FOREIGN KEY fk_lr_test_type;
ALTER TABLE lab_results               DROP FOREIGN KEY fk_res_request;
ALTER TABLE equipment_maintenance     DROP FOREIGN KEY fk_maint_equip;

-- Step 2: Alter parent tables first (referenced tables)
ALTER TABLE lab_test_types
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

ALTER TABLE equipment
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

-- Step 3: Alter child/dependent tables
ALTER TABLE lab_test_reference_ranges
    MODIFY COLUMN id           BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN test_type_id BIGINT NOT NULL;

ALTER TABLE lab_requests
    MODIFY COLUMN id              BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN consultation_id BIGINT NOT NULL,
    MODIFY COLUMN patient_id      BIGINT NOT NULL,
    MODIFY COLUMN doctor_id       BIGINT NOT NULL,
    MODIFY COLUMN test_type_id    BIGINT NOT NULL;

ALTER TABLE lab_results
    MODIFY COLUMN id             BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN lab_request_id BIGINT NOT NULL,
    MODIFY COLUMN technician_id  BIGINT NOT NULL;

ALTER TABLE equipment_maintenance
    MODIFY COLUMN id           BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN equipment_id BIGINT NOT NULL,
    MODIFY COLUMN reported_by  BIGINT NULL;

-- Step 4: Recreate FK constraints
ALTER TABLE lab_test_reference_ranges
    ADD CONSTRAINT fk_ref_range_test
        FOREIGN KEY (test_type_id) REFERENCES lab_test_types(id) ON DELETE CASCADE;

ALTER TABLE lab_requests
    ADD CONSTRAINT fk_lr_test_type
        FOREIGN KEY (test_type_id) REFERENCES lab_test_types(id);

ALTER TABLE lab_results
    ADD CONSTRAINT fk_res_request
        FOREIGN KEY (lab_request_id) REFERENCES lab_requests(id);

ALTER TABLE equipment_maintenance
    ADD CONSTRAINT fk_maint_equip
        FOREIGN KEY (equipment_id) REFERENCES equipment(id);

SET FOREIGN_KEY_CHECKS = 1;
