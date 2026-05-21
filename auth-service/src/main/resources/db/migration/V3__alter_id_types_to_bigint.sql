-- =============================================================
-- auth-service — careconnect_auth
-- V3__alter_id_types_to_bigint.sql
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE users DROP FOREIGN KEY fk_users_dept;

ALTER TABLE departments MODIFY id BIGINT UNSIGNED AUTO_INCREMENT;

ALTER TABLE users MODIFY id BIGINT UNSIGNED AUTO_INCREMENT;
ALTER TABLE users MODIFY department_id BIGINT UNSIGNED NULL;

ALTER TABLE users ADD CONSTRAINT fk_users_dept FOREIGN KEY (department_id)
    REFERENCES departments(id) ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;
