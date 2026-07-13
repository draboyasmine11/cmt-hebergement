-- Script SQL MySQL - CMT SONABEL
-- Base de données : cmt_db

CREATE DATABASE IF NOT EXISTS cmt_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cmt_db;

-- Rôles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO roles (id, nom) VALUES
    (1, 'ADMIN'),
    (2, 'GERANT'),
    (3, 'CLIENT');

-- Utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(20),
    matricule VARCHAR(50) UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    centre_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS utilisateur_roles (
    utilisateur_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (utilisateur_id, role_id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Centres
CREATE TABLE IF NOT EXISTS centres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    image VARCHAR(500),
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE utilisateurs
    ADD CONSTRAINT fk_utilisateur_centre
    FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE SET NULL;

-- Chambres
CREATE TABLE IF NOT EXISTS chambres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(20) NOT NULL,
    type_chambre VARCHAR(50) NOT NULL,
    capacite INT NOT NULL,
    prix_par_nuit DECIMAL(12, 2) NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    centre_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE CASCADE,
    UNIQUE KEY uk_chambre_centre_numero (centre_id, numero)
);

-- Réservations
CREATE TABLE IF NOT EXISTS reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date_reservation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_arrivee DATE NOT NULL,
    date_depart DATE NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    montant_total DECIMAL(12, 2),
    utilisateur_id BIGINT NOT NULL,
    chambre_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
    FOREIGN KEY (chambre_id) REFERENCES chambres(id),
    CHECK (date_depart > date_arrivee)
);

-- Paiements
CREATE TABLE IF NOT EXISTS paiements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    montant DECIMAL(12, 2) NOT NULL,
    date_paiement TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mode_paiement VARCHAR(20) NOT NULL,
    reference VARCHAR(100),
    reservation_id BIGINT NOT NULL UNIQUE,
    enregistre_par_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (enregistre_par_id) REFERENCES utilisateurs(id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_notification VARCHAR(50) NOT NULL,
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    utilisateur_id BIGINT NOT NULL,
    reservation_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
);

-- Données de démonstration
INSERT INTO centres (nom, ville, adresse, latitude, longitude, description, statut) VALUES
    ('CMT Ouagadougou', 'Ouagadougou', 'Avenue de la Nation, Secteur 4', 12.3714287, -1.5196603,
     'Centre principal d''hébergement des travailleurs SONABEL à Ouagadougou.', 'ACTIF'),
    ('CMT Bobo-Dioulasso', 'Bobo-Dioulasso', 'Quartier Konsa, Rue 25', 11.1781116, -4.2894300,
     'Centre d''hébergement régional pour les agents SONABEL de l''ouest.', 'ACTIF'),
    ('CMT Koudougou', 'Koudougou', 'Zone industrielle', 12.2527650, -2.3617700,
     'Centre d''hébergement pour les travailleurs de la zone centre-ouest.', 'ACTIF');

INSERT INTO chambres (numero, type_chambre, capacite, prix_par_nuit, statut, centre_id) VALUES
    ('101', 'SIMPLE', 1, 5000.00, 'DISPONIBLE', 1),
    ('102', 'DOUBLE', 2, 8000.00, 'DISPONIBLE', 1),
    ('103', 'SUITE', 3, 12000.00, 'DISPONIBLE', 1),
    ('201', 'SIMPLE', 1, 4500.00, 'DISPONIBLE', 2),
    ('202', 'DOUBLE', 2, 7500.00, 'DISPONIBLE', 2),
    ('301', 'SIMPLE', 1, 4000.00, 'DISPONIBLE', 3);

-- Mot de passe : Admin@2026 (BCrypt)
INSERT INTO utilisateurs (nom, prenom, email, telephone, matricule, mot_de_passe, actif) VALUES
    ('Admin', 'SONABEL', 'admin@sonabel.bf', '+22670000001', 'ADM001',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE),
    ('Kaboré', 'Issa', 'gerant@sonabel.bf', '+22670000002', 'GER001',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE),
    ('Ouédraogo', 'Aminata', 'client@sonabel.bf', '+22670000003', 'CLI001',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE);

UPDATE utilisateurs SET centre_id = 1 WHERE email = 'gerant@sonabel.bf';

INSERT INTO utilisateur_roles (utilisateur_id, role_id) VALUES
    (1, 1),
    (2, 2),
    (3, 3);
