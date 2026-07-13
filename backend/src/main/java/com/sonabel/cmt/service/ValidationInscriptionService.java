package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.response.DemandeInscriptionResponse;
import com.sonabel.cmt.entity.Utilisateur;
import com.sonabel.cmt.enums.StatutCompte;
import com.sonabel.cmt.enums.TypeNotification;
import com.sonabel.cmt.exception.BusinessException;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ValidationInscriptionService {

    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;

    public List<DemandeInscriptionResponse> listerDemandes() {
        return utilisateurRepository.findByStatutCompteAndDeletedAtIsNullOrderByCreatedAtDesc(StatutCompte.EN_ATTENTE)
                .stream()
                .map(this::toDemandeResponse)
                .toList();
    }

    @Transactional
    public DemandeInscriptionResponse approuver(Long utilisateurId) {
        Utilisateur utilisateur = getById(utilisateurId);

        if (utilisateur.getStatutCompte() != StatutCompte.EN_ATTENTE) {
            throw new BusinessException("Cette demande n'est plus en attente");
        }

        utilisateur.setStatutCompte(StatutCompte.ACTIF);

        Utilisateur saved = utilisateurRepository.save(utilisateur);

        // Envoi de la notification in-app et par email/SMS
        notificationService.creerNotification(utilisateur,
                TypeNotification.COMPTE_APPROUVE,
                "Compte approuvé",
                "Votre compte CMT-SONABEL a été approuvé. Vous pouvez dès à présent vous connecter.",
                null);

        return toDemandeResponse(saved);
    }

    @Transactional
    public DemandeInscriptionResponse rejeter(Long utilisateurId, String motif) {
        Utilisateur utilisateur = getById(utilisateurId);

        if (utilisateur.getStatutCompte() != StatutCompte.EN_ATTENTE) {
            throw new BusinessException("Cette demande n'est plus en attente");
        }

        utilisateur.setStatutCompte(StatutCompte.REJETE);
        utilisateur.setMotifRejet(motif);

        Utilisateur saved = utilisateurRepository.save(utilisateur);

        // Envoi de la notification in-app et par email/SMS avec le motif du rejet
        notificationService.creerNotification(utilisateur,
                TypeNotification.COMPTE_REJETE,
                "Compte rejeté",
                "Votre demande d'inscription a été rejetée. Motif : " + (motif != null ? motif : "Non spécifié"),
                null);

        return toDemandeResponse(saved);
    }

    public DemandeInscriptionResponse consulterDossier(Long utilisateurId) {
        return toDemandeResponse(getById(utilisateurId));
    }

    private DemandeInscriptionResponse toDemandeResponse(Utilisateur u) {
        return DemandeInscriptionResponse.builder()
                .id(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .sexe(u.getSexe())
                .dateNaissance(u.getDateNaissance())
                .email(u.getEmail())
                .telephone(u.getTelephone())
                .adresse(u.getAdresse())
                .matricule(u.getMatricule())
                .direction(u.getDirection())
                .service(u.getService())
                .fonction(u.getFonction())
                .dateDepartRetraite(u.getDateDepartRetraite())
                .typeClient(u.getTypeClient())
                .statutCompte(u.getStatutCompte())
                .typePiece(u.getTypePiece() != null ? u.getTypePiece().name() : null)
                .numeroPiece(u.getNumeroPiece())
                .username(u.getUsername())
                .fichierJustificatif(u.getFichierJustificatif())
                .motifRejet(u.getMotifRejet())
                .tauxReduction(u.getTauxReduction())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }

    private Utilisateur getById(Long id) {
        return utilisateurRepository.findActifById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }
}
