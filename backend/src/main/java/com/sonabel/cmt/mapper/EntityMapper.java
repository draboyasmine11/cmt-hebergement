package com.sonabel.cmt.mapper;

import com.sonabel.cmt.dto.response.*;
import com.sonabel.cmt.entity.*;
import com.sonabel.cmt.enums.RoleType;
import com.sonabel.cmt.enums.StatutChambre;

import java.time.LocalDate;
import java.util.stream.Collectors;

public final class EntityMapper {

    private EntityMapper() {}

    public static UtilisateurResponse toUtilisateurResponse(Utilisateur u) {
        RoleType primaryRole = u.getRoles().stream()
                .findFirst()
                .map(r -> r.getNom())
                .orElse(null);
        return UtilisateurResponse.builder()
                .id(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .sexe(u.getSexe())
                .email(u.getEmail())
                .username(u.getUsername())
                .telephone(u.getTelephone())
                .adresse(u.getAdresse())
                .photoUrl(u.getPhotoUrl())
                .matricule(u.getMatricule())
                .fonction(u.getFonction())
                .niveauAcces(u.getNiveauAcces())
                .typeClient(u.getTypeClient())
                .statutCompte(u.getStatutCompte())
                .dateNaissance(u.getDateNaissance())
                .dateDepartRetraite(u.getDateDepartRetraite())
                .tauxReduction(u.getTauxReduction())
                .motifRejet(u.getMotifRejet())
                .direction(u.getDirection())
                .service(u.getService())
                .typePiece(u.getTypePiece())
                .numeroPiece(u.getNumeroPiece())
                .fichierJustificatif(u.getFichierJustificatif())
                .nationalite(u.getNationalite())
                .profession(u.getProfession())
                .actif(u.getActif())
                .centreId(u.getCentre() != null ? u.getCentre().getId() : null)
                .centreNom(u.getCentre() != null ? u.getCentre().getNom() : null)
                .roles(u.getRoles().stream().map(r -> r.getNom().name()).collect(Collectors.toSet()))
                .typeUtilisateur(primaryRole)
                .createdAt(u.getCreatedAt())
                .build();
    }

    public static CentreResponse toCentreResponse(Centre c) {
        long total = c.getChambres() != null ? c.getChambres().size() : 0;
        long dispo = c.getChambres() != null
                ? c.getChambres().stream().filter(ch -> ch.getStatut() == StatutChambre.DISPONIBLE).count()
                : 0;
        return CentreResponse.builder()
                .id(c.getId())
                .nom(c.getNom())
                .ville(c.getVille())
                .adresse(c.getAdresse())
                .telephone(c.getTelephone())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .description(c.getDescription())
                .image(c.getImage())
                .statut(c.getStatut())
                .nombreChambres(total)
                .chambresDisponibles(dispo)
                .build();
    }

    public static ChambreResponse toChambreResponse(Chambre ch, boolean disponible, String clientNom, LocalDate dateArrivee, LocalDate dateDepart) {
        return ChambreResponse.builder()
                .id(ch.getId())
                .numero(ch.getNumero())
                .image(ch.getImage())
                .prixParNuit(ch.getPrixParNuit())
                .statut(ch.getStatut())
                .centreId(ch.getCentre().getId())
                .centreNom(ch.getCentre().getNom())
                .centreVille(ch.getCentre().getVille())
                .disponible(disponible)
                .clientNom(clientNom)
                .dateArrivee(dateArrivee)
                .dateDepart(dateDepart)
                .build();
    }

    public static ReservationResponse toReservationResponse(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .dateReservation(r.getDateReservation())
                .dateArrivee(r.getDateArrivee())
                .dateDepart(r.getDateDepart())
                .dateSortieReelle(r.getDateSortieReelle())
                .statut(r.getStatut())
                .montantTotal(r.getMontantTotal())
                .utilisateurId(r.getUtilisateur().getId())
                .utilisateurNom(r.getUtilisateur().getPrenom() + " " + r.getUtilisateur().getNom())
                .chambreId(r.getChambre().getId())
                .chambreNumero(r.getChambre().getNumero())
                .chambreType(r.getChambre().getType())
                .centreId(r.getChambre().getCentre().getId())
                .centreNom(r.getChambre().getCentre().getNom())
                .payee(r.getPaiement() != null)
                .motifRejet(r.getMotifRejet())
                .build();
    }

    public static PaiementResponse toPaiementResponse(Paiement p) {
        return PaiementResponse.builder()
                .id(p.getId())
                .montant(p.getMontant())
                .datePaiement(p.getDatePaiement())
                .modePaiement(p.getModePaiement())
                .reference(p.getReference())
                .reservationId(p.getReservation().getId())
                .clientNom(p.getReservation().getUtilisateur().getPrenom() + " " +
                        p.getReservation().getUtilisateur().getNom())
                .chambreNumero(p.getReservation().getChambre().getNumero())
                .chambreType(p.getReservation().getChambre().getType())
                .dateSortieReelle(p.getReservation().getDateSortieReelle())
                .build();
    }

    public static NotificationResponse toNotificationResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .typeNotification(n.getTypeNotification())
                .titre(n.getTitre())
                .message(n.getMessage())
                .lu(n.getLu())
                .reservationId(n.getReservation() != null ? n.getReservation().getId() : null)
                .createdAt(n.getCreatedAt())
                .build();
    }

    public static PermissionResponse toPermissionResponse(Permission p) {
        return PermissionResponse.builder()
                .id(p.getId())
                .code(p.getCode())
                .libelle(p.getLibelle())
                .description(p.getDescription())
                .module(p.getModule())
                .createdAt(p.getCreatedAt())
                .build();
    }

    public static RoleResponse toRoleResponse(Role r, long nombreUtilisateurs) {
        return RoleResponse.builder()
                .id(r.getId())
                .nom(r.getNom().name())
                .description(r.getDescription())
                .actif(r.getActif())
                .nombreUtilisateurs(nombreUtilisateurs)
                .createdAt(r.getCreatedAt())
                .permissions(r.getPermissions().stream()
                        .map(EntityMapper::toPermissionResponse)
                        .collect(Collectors.toSet()))
                .build();
    }
}
