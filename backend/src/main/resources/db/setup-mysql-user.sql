-- Configuration MySQL pour CMT SONABEL
-- Exécuter en tant qu'administrateur MySQL (root) :
-- mysql -u root -p < src/main/resources/db/setup-mysql-user.sql

CREATE DATABASE IF NOT EXISTS cmt_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Créer l'utilisateur applicatif (identifiants = application.yml)
CREATE USER IF NOT EXISTS 'cmt_user'@'localhost' IDENTIFIED BY 'cmt2026';

GRANT ALL PRIVILEGES ON cmt_db.* TO 'cmt_user'@'localhost';
FLUSH PRIVILEGES;

-- Vérification
SHOW GRANTS FOR 'cmt_user'@'localhost';
