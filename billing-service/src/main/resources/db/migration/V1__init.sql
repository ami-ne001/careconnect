-- =============================================================
-- billing-service — careconnect_billing
-- V1__init.sql
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE invoices (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT UNSIGNED  NOT NULL,   -- ref to auth-service users.id
    consultation_id INT UNSIGNED  NULL,        -- ref to clinical-service
    admission_id    INT UNSIGNED  NULL,        -- ref to patient-service
    surgery_id      INT UNSIGNED  NULL,        -- ref to clinical-service
    issued_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date        DATE,
    total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_amount     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status          ENUM('PENDING','PARTIALLY_PAID','PAID','OVERDUE','CANCELLED')
                    NOT NULL DEFAULT 'PENDING',
    notes           TEXT
);

CREATE TABLE invoice_items (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id  INT UNSIGNED  NOT NULL,
    description VARCHAR(200)  NOT NULL,
    quantity    SMALLINT      NOT NULL DEFAULT 1,
    unit_price  DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_ii_invoice FOREIGN KEY (invoice_id)
        REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE payments (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id  INT UNSIGNED  NOT NULL,
    received_by INT UNSIGNED  NULL,   -- ref to auth-service users.id
    amount      DECIMAL(10,2) NOT NULL,
    method      ENUM('CASH','CARD','INSURANCE','TRANSFER') NOT NULL,
    paid_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reference   VARCHAR(100),
    CONSTRAINT fk_pay_invoice FOREIGN KEY (invoice_id)
        REFERENCES invoices(id)
);

SET FOREIGN_KEY_CHECKS = 1;
