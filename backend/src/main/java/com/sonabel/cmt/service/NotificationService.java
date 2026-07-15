package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.EmailData;
import com.sonabel.cmt.dto.response.NotificationResponse;
import com.sonabel.cmt.entity.Notification;
import com.sonabel.cmt.entity.Reservation;
import com.sonabel.cmt.entity.Utilisateur;
import com.sonabel.cmt.enums.TypeNotification;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.mapper.EntityMapper;
import com.sonabel.cmt.repository.NotificationRepository;
import com.sonabel.cmt.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final FactureService factureService;
    private final ApplicationContext applicationContext;

    private NotificationService self() {
        return applicationContext.getBean(NotificationService.class);
    }

    public List<NotificationResponse> findByUtilisateur(Long utilisateurId) {
        return notificationRepository.findByUtilisateurIdOrderByCreatedAtDesc(utilisateurId)
                .stream()
                .map(EntityMapper::toNotificationResponse)
                .toList();
    }

    public long countNonLues(Long utilisateurId) {
        return notificationRepository.countByUtilisateurIdAndLuFalse(utilisateurId);
    }

    @Transactional
    public void marquerCommeLue(Long id, Long utilisateurId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable"));
        if (!notification.getUtilisateur().getId().equals(utilisateurId)) {
            throw new ResourceNotFoundException("Notification introuvable");
        }
        notification.setLu(true);
    }

    @Transactional
    public void marquerToutesCommeLues(Long utilisateurId) {
        notificationRepository.findByUtilisateurIdOrderByCreatedAtDesc(utilisateurId)
                .forEach(n -> n.setLu(true));
    }

    @Async
    @Transactional
    public void creerNotification(Utilisateur utilisateur, TypeNotification type, String titre,
                                   String message, Reservation reservation, EmailData emailData) {
        // Tout recharger depuis la BDD dans ce thread async — les entités passées sont détachées
        Long utilisateurId = utilisateur.getId();
        Long reservationId = reservation != null ? reservation.getId() : null;

        Utilisateur u = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable id=" + utilisateurId));

        Reservation r = null;
        if (reservationId != null) {
            r = notificationRepository.findReservationById(reservationId).orElse(null);
        }

        notificationRepository.save(Notification.builder()
                .utilisateur(u)
                .typeNotification(type)
                .titre(titre)
                .message(message)
                .reservation(r)
                .lu(false)
                .build());

        if (u.getEmail() != null) {
            try {
                String html = buildEmailHtml(type, u.getPrenom(), emailData, r);
                if (html != null) {
                    emailService.envoyer(u.getEmail(), titre, html);
                }
            } catch (Exception e) {
                log.error("Erreur email pour {} : {}", u.getEmail(), e.getMessage(), e);
            }
        }

        if (type == TypeNotification.PAYEMENT_CONFIRME && reservationId != null && u.getEmail() != null) {
            try {
                byte[] pdf = factureService.genererFacture(reservationId);
                String html = emailService.paiementConfirmeHtml(
                        u.getPrenom(),
                        emailData != null ? emailData.chambre() : "",
                        emailData != null ? emailData.centre() : "",
                        String.format("%,.0f", emailData != null ? emailData.montant() : 0),
                        emailData != null && emailData.modePaiement() != null ? emailData.modePaiement() : "",
                        emailData != null && emailData.reference() != null ? emailData.reference() : ""
                );
                emailService.envoyerAvecPieceJointe(u.getEmail(), titre, html,
                        "facture-" + reservationId + ".pdf", pdf);
                log.info("Facture PDF envoyée à {} pour réservation {}", u.getEmail(), reservationId);
            } catch (Exception e) {
                log.error("Erreur facture PDF réservation {} : {}", reservationId, e.getMessage(), e);
            }
        }

        if (u.getTelephone() != null) {
            try {
                String texte = buildSmsTexte(type, message);
                if (texte != null) smsService.envoyer(u.getTelephone(), texte);
            } catch (Exception e) {
                log.error("Erreur SMS pour {} : {}", u.getTelephone(), e.getMessage(), e);
            }
        }
    }

    @Async
    @Transactional
    public void notifierAdmins(TypeNotification type, String titre, String message, Reservation reservation, EmailData emailData) {
        utilisateurRepository.findAllAdmins()
                .forEach(u -> self().creerNotification(u, type, titre, message, reservation, emailData));
    }

    @Async
    @Transactional
    public void notifierGerantsCentre(Long centreId, TypeNotification type, String titre,
                                       String message, Reservation reservation, EmailData emailData) {
        List<Utilisateur> gerants = utilisateurRepository.findGerantsByCentreId(centreId);
        if (gerants.isEmpty()) {
            log.warn("Aucun gérant actif trouvé pour le centre id={} lors de la notification type={}", centreId, type);
        }
        gerants.forEach(u -> self().creerNotification(u, type, titre, message, reservation, emailData));
    }

    private String buildEmailHtml(TypeNotification type, String prenom, EmailData d, Reservation r) {
        String chambre = d != null ? d.chambre() : "";
        String centre  = d != null ? d.centre()  : "";
        String arrivee = d != null ? d.arrivee() : "";
        String depart  = d != null ? d.depart()  : "";
        double montant = d != null ? d.montant() : 0;

        return switch (type) {
            case NOUVELLE_RESERVATION -> emailService.reservationCreeeHtml(prenom, chambre, centre, arrivee, depart, montant);
            case RESERVATION_VALIDEE  -> emailService.reservationValideeHtml(prenom, chambre, centre, arrivee, depart, montant);
            case RESERVATION_REFUSEE  -> {
                String motif = (d != null && d.motif() != null && !d.motif().isBlank()) ? d.motif() : "Non spécifié";
                yield emailService.reservationRefuseeHtml(prenom, chambre, centre, arrivee, depart, motif);
            }
            case RESERVATION_ANNULEE  -> emailService.reservationAnnuleeHtml(prenom, chambre);
            case COMPTE_APPROUVE      -> emailService.compteApprouveHtml(prenom);
            case COMPTE_REJETE        -> {
                String motif = (d != null && d.motif() != null && !d.motif().isBlank()) ? d.motif() : "Non spécifié";
                yield emailService.compteRejeteHtml(prenom, motif);
            }
            case PAYEMENT_CONFIRME    -> null; // géré séparément avec pièce jointe
            case NOUVELLE_DEMANDE_INSCRIPTION -> {
                String nom       = r != null && r.getUtilisateur() != null ? r.getUtilisateur().getNom()       : "";
                String email     = r != null && r.getUtilisateur() != null ? r.getUtilisateur().getEmail()     : "";
                String telephone = r != null && r.getUtilisateur() != null ? r.getUtilisateur().getTelephone() : "";
                yield emailService.nouvelleDemandeInscriptionHtml(prenom, nom, email, telephone);
            }
            default -> null;
        };
    }

    private String buildSmsTexte(TypeNotification type, String message) {
        return "CMT: " + message;
    }
}
