-- =============================================================
-- V4__simplify_statuses.sql
-- Remove NO_SHOW from appointments status enum.
-- Remove NO_SHOW from queue status enum (CALLED is kept).
-- =============================================================

-- Update any existing NO_SHOW appointments to CANCELLED before altering the column
UPDATE appointments SET status = 'CANCELLED' WHERE status = 'NO_SHOW';

-- Alter appointments status ENUM: remove NO_SHOW
ALTER TABLE appointments
    MODIFY COLUMN status ENUM('SCHEDULED','CONFIRMED','CHECKED_IN','IN_PROGRESS','COMPLETED','CANCELLED')
    NOT NULL DEFAULT 'SCHEDULED';

-- Update any existing NO_SHOW queue entries to DONE before altering the column
UPDATE queue SET status = 'DONE' WHERE status = 'NO_SHOW';

-- Alter queue status ENUM: remove NO_SHOW (keep WAITING, CALLED, IN_ROOM, DONE)
ALTER TABLE queue
    MODIFY COLUMN status ENUM('WAITING','CALLED','IN_ROOM','DONE')
    NOT NULL DEFAULT 'WAITING';
