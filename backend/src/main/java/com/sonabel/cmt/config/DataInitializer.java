package com.sonabel.cmt.config;

import com.sonabel.cmt.entity.Permission;
import com.sonabel.cmt.entity.Role;
import com.sonabel.cmt.enums.RoleType;
import com.sonabel.cmt.repository.PermissionRepository;
import com.sonabel.cmt.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Order(1)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        List<Permission> allPermissions = createPermissions();
        Map<String, Permission> permMap = allPermissions.stream()
                .collect(Collectors.toMap(Permission::getCode, p -> p));

        createRoleWithPermissions(RoleType.ADMIN, "Accès complet à toutes les fonctionnalités du système", true, allPermissions.toArray(new Permission[0]));
        createRoleWithPermissions(RoleType.GERANT, "Gestion des chambres, réservations, paiements et rapports du centre", true,
                permMap.get("CHAMBRES_CONSULTER"),
                permMap.get("CHAMBRES_AJOUTER"),
                permMap.get("CHAMBRES_MODIFIER"),
                permMap.get("CHAMBRES_SUPPRIMER"),
                permMap.get("RESERVATIONS_CONSULTER"),
                permMap.get("RESERVATIONS_VALIDER"),
                permMap.get("RESERVATIONS_REFUSER"),
                permMap.get("RESERVATIONS_ANNULER"),
                permMap.get("PAIEMENTS_CONSULTER"),
                permMap.get("PAIEMENTS_ENREGISTRER"),
                permMap.get("PAIEMENTS_VALIDER"),
                permMap.get("FACTURES_CONSULTER"),
                permMap.get("FACTURES_GENERER"),
                permMap.get("FACTURES_TELECHARGER"),
                permMap.get("FACTURES_IMPRIMER"),
                permMap.get("RAPPORTS_CONSULTER"),
                permMap.get("RAPPORTS_GENERER"),
                permMap.get("UTILISATEURS_CONSULTER"));
        createRoleWithPermissions(RoleType.CLIENT, "Accès limité à son profil, ses réservations et ses paiements", true,
                permMap.get("RESERVATIONS_CONSULTER"),
                permMap.get("RESERVATIONS_CREER"),
                permMap.get("RESERVATIONS_ANNULER"),
                permMap.get("PAIEMENTS_CONSULTER"),
                permMap.get("PAIEMENTS_ENREGISTRER"),
                permMap.get("FACTURES_CONSULTER"),
                permMap.get("FACTURES_TELECHARGER"));
    }

    private List<Permission> createPermissions() {
        List<Permission> defaults = List.of(
                createPerm("UTILISATEURS_CONSULTER", "Consulter utilisateurs", "Voir la liste des utilisateurs", "Utilisateurs"),
                createPerm("UTILISATEURS_CREER", "Créer utilisateur", "Ajouter un nouvel utilisateur", "Utilisateurs"),
                createPerm("UTILISATEURS_MODIFIER", "Modifier utilisateur", "Modifier les informations d'un utilisateur", "Utilisateurs"),
                createPerm("UTILISATEURS_DESACTIVER", "Désactiver utilisateur", "Désactiver un compte utilisateur", "Utilisateurs"),
                createPerm("UTILISATEURS_RESET_PASSWORD", "Réinitialiser mot de passe", "Réinitialiser le mot de passe d'un utilisateur", "Utilisateurs"),
                createPerm("UTILISATEURS_SUPPRIMER", "Supprimer utilisateur", "Supprimer un compte utilisateur", "Utilisateurs"),

                createPerm("CHAMBRES_CONSULTER", "Consulter chambres", "Voir la liste des chambres", "Chambres"),
                createPerm("CHAMBRES_AJOUTER", "Ajouter chambre", "Créer une nouvelle chambre", "Chambres"),
                createPerm("CHAMBRES_MODIFIER", "Modifier chambre", "Modifier une chambre existante", "Chambres"),
                createPerm("CHAMBRES_SUPPRIMER", "Supprimer chambre", "Supprimer une chambre", "Chambres"),

                createPerm("RESERVATIONS_CONSULTER", "Consulter réservations", "Voir la liste des réservations", "Réservations"),
                createPerm("RESERVATIONS_CREER", "Créer réservation", "Effectuer une nouvelle réservation", "Réservations"),
                createPerm("RESERVATIONS_MODIFIER", "Modifier réservation", "Modifier une réservation existante", "Réservations"),
                createPerm("RESERVATIONS_VALIDER", "Valider réservation", "Valider une réservation en attente", "Réservations"),
                createPerm("RESERVATIONS_REFUSER", "Refuser réservation", "Refuser une réservation en attente", "Réservations"),
                createPerm("RESERVATIONS_ANNULER", "Annuler réservation", "Annuler une réservation", "Réservations"),

                createPerm("PAIEMENTS_CONSULTER", "Consulter paiements", "Voir la liste des paiements", "Paiements"),
                createPerm("PAIEMENTS_ENREGISTRER", "Enregistrer paiement", "Enregistrer un nouveau paiement", "Paiements"),
                createPerm("PAIEMENTS_VALIDER", "Valider paiement", "Valider un paiement", "Paiements"),
                createPerm("PAIEMENTS_ANNULER", "Annuler paiement", "Annuler un paiement", "Paiements"),

                createPerm("FACTURES_CONSULTER", "Consulter factures", "Voir la liste des factures", "Factures"),
                createPerm("FACTURES_GENERER", "Générer facture", "Générer une facture PDF", "Factures"),
                createPerm("FACTURES_TELECHARGER", "Télécharger PDF", "Télécharger une facture au format PDF", "Factures"),
                createPerm("FACTURES_IMPRIMER", "Imprimer facture", "Imprimer une facture", "Factures"),

                createPerm("RAPPORTS_CONSULTER", "Consulter statistiques", "Voir les tableaux de bord et statistiques", "Rapports"),
                createPerm("RAPPORTS_GENERER", "Générer rapports", "Générer des rapports personnalisés", "Rapports"),
                createPerm("RAPPORTS_EXPORT_EXCEL", "Export Excel", "Exporter les données vers Excel", "Rapports"),
                createPerm("RAPPORTS_EXPORT_PDF", "Export PDF", "Exporter les rapports en PDF", "Rapports"),

                createPerm("PARAMETRES_MODIFIER", "Modifier paramètres système", "Configurer les paramètres de l'application", "Paramètres"),
                createPerm("PARAMETRES_GERER_ROLES", "Gérer rôles", "Créer, modifier et supprimer des rôles", "Paramètres"),
                createPerm("PARAMETRES_GERER_PERMISSIONS", "Gérer permissions", "Attribuer des permissions aux rôles", "Paramètres")
        );

        return defaults.stream()
                .map(p -> permissionRepository.findByCode(p.getCode()).orElseGet(() -> permissionRepository.save(p)))
                .toList();
    }

    private Permission createPerm(String code, String libelle, String description, String module) {
        return Permission.builder()
                .code(code)
                .libelle(libelle)
                .description(description)
                .module(module)
                .build();
    }

    private void createRoleWithPermissions(RoleType type, String description, boolean actif, Permission... perms) {
        roleRepository.findByNom(type).ifPresentOrElse(role -> {
            role.setDescription(description);
            role.setActif(actif);
            if (role.getPermissions().isEmpty() && perms.length > 0) {
                role.setPermissions(Set.of(perms));
            }
            roleRepository.save(role);
        }, () -> {
            Role role = Role.builder()
                    .nom(type)
                    .description(description)
                    .actif(actif)
                    .permissions(perms.length > 0 ? Set.of(perms) : Set.of())
                    .build();
            roleRepository.save(role);
        });
    }
}
