-- =============================================================
-- billing-service — careconnect_billing
-- V2__alter_pk_to_bigint.sql
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Drop all FK constraints that reference columns we need to alter
ALTER TABLE invoice_items DROP FOREIGN KEY fk_ii_invoice;
ALTER TABLE payments      DROP FOREIGN KEY fk_pay_invoice;

-- Step 2: Alter parent tables first (referenced tables)
ALTER TABLE invoices
    MODIFY COLUMN id              BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN patient_id      BIGINT NOT NULL,
    MODIFY COLUMN consultation_id BIGINT NULL,
    MODIFY COLUMN admission_id    BIGINT NULL,
    MODIFY COLUMN surgery_id      BIGINT NULL;

-- Step 3: Alter child/dependent tables
ALTER TABLE invoice_items
    MODIFY COLUMN id         BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN invoice_id BIGINT NOT NULL,
    MODIFY COLUMN quantity   INT NOT NULL DEFAULT 1;

ALTER TABLE payments
    MODIFY COLUMN id          BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN invoice_id  BIGINT NOT NULL,
    MODIFY COLUMN received_by BIGINT NULL;

-- Step 4: Recreate FK constraints
ALTER TABLE invoice_items
    ADD CONSTRAINT fk_ii_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;

ALTER TABLE payments
    ADD CONSTRAINT fk_pay_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
