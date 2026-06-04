-- =============================================================
-- V5__rename_confirmed_to_pending_approval.sql
-- Rename CONFIRMED status to PENDING_APPROVAL in appointments.
-- CONFIRMED was never actively used; PENDING_APPROVAL replaces it
-- to represent patient-submitted appointment requests awaiting
-- receptionist approval before being set to SCHEDULED.
-- =============================================================

-- Step 1: Migrate any existing CONFIRMED rows to PENDING_APPROVAL
UPDATE appointments SET status = 'PENDING_APPROVAL' WHERE status = 'CONFIRMED';

-- Step 2: Alter the ENUM to replace CONFIRMED with PENDING_APPROVAL
ALTER TABLE appointments
    MODIFY COLUMN status ENUM('SCHEDULED','PENDING_APPROVAL','CHECKED_IN','IN_PROGRESS','COMPLETED','CANCELLED')
    NOT NULL DEFAULT 'SCHEDULED';
