-- ===========================================================================
-- SCRIPT DE RÉINITIALISATION DES DONNÉES - CMT SONABEL
-- Conserve : centres, chambres, tarifs, et les 3 utilisateurs autorisés
-- Supprime  : réservations, paiements, notifications, séjours, signalements
-- ===========================================================================

USE cmt_db;

-- Désactiver les vérifications FK temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Supprimer toutes les notifications
DELETE FROM notifications;

-- 2. Supprimer tous les paiements
DELETE FROM paiements;

-- 3. Supprimer toutes les réservations
DELETE FROM reservations;

-- 4. Supprimer tous les signalements (si table existe)
DELETE FROM signalements;

-- 5. Supprimer les séjours / occupations (si table existe)
-- DELETE FROM sejours;

-- 6. Supprimer les utilisateurs NON autorisés
--    On garde uniquement : admin@sonabel.bf, ali@gmail.com, drabonana2004@gmail.com
DELETE FROM utilisateur_roles
WHERE utilisateur_id NOT IN (
    SELECT id FROM utilisateurs
    WHERE email IN ('admin@sonabel.bf', 'ali@gmail.com', 'drabonana2004@gmail.com')
);

DELETE FROM utilisateurs
WHERE email NOT IN ('admin@sonabel.bf', 'ali@gmail.com', 'drabonana2004@gmail.com');

-- 7. Remettre les statuts des chambres à DISPONIBLE
UPDATE chambres SET statut = 'DISPONIBLE' WHERE statut IN ('OCCUPEE');

-- 8. S'assurer que la colonne motif_rejet existe dans reservations
ALTER TABLE reservations
    ADD COLUMN IF NOT EXISTS motif_rejet VARCHAR(500) NULL;

-- Réactiver les vérifications FK
SET FOREIGN_KEY_CHECKS = 1;

-- Vérification
SELECT 'Réservations restantes :' AS info, COUNT(*) AS nb FROM reservations
UNION ALL
SELECT 'Paiements restants :', COUNT(*) FROM paiements
UNION ALL
SELECT 'Notifications restantes :', COUNT(*) FROM notifications
UNION ALL
SELECT 'Utilisateurs restants :', COUNT(*) FROM utilisateurs;
