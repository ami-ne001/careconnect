-- =============================================================
-- clinical-service — careconnect_clinical
-- V6__add_surgery_price.sql
-- =============================================================

ALTER TABLE surgeries ADD COLUMN price DECIMAL(10,2) NULL;
