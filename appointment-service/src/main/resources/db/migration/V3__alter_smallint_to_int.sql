-- =============================================================
-- appointment-service — careconnect_appointment
-- V3__alter_smallint_to_int.sql
-- =============================================================

-- Hibernate maps Java Integer to INTEGER (INT), not SMALLINT.
-- Promote the two SMALLINT columns to INT to match the entity types.

ALTER TABLE appointments
    MODIFY COLUMN duration_minutes INT NOT NULL DEFAULT 30;

ALTER TABLE queue
    MODIFY COLUMN ticket_number INT NOT NULL;
