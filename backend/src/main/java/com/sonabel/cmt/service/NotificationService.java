package com.sonabel.cmt.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EmailService emailService;
    private final SmsService smsService;

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

    public void creerNotification(Utilisateur utilisateur, TypeNotification type, String titre,
                                  String message, Reservation reservation) {
        // In-app notification
        Notification notification = Notification.builder()
                .utilisateur(utilisateur)
                .typeNotification(type)
                .titre(titre)
                .message(message)
                .reservation(reservation)
                .lu(false)
                .build();
        notificationRepository.save(notification);

        // Email (enveloppé dans un try-catch pour ne pas impacter la notification in-app)
        if (utilisateur.getEmail() != null) {
            try {
                String html = buildEmailHtml(type, utilisateur.getPrenom(), reservation, message);
                if (html != null) {
                    emailService.envoyer(utilisateur.getEmail(), titre, html);
                }
            } catch (Exception e) {
                log.error("Erreur lors de la préparation de l'email pour {} : {}", utilisateur.getEmail(), e.getMessage(), e);
            }
        }

        // SMS (enveloppé dans un try-catch pour ne pas impacter la notification in-app)
        if (utilisateur.getTelephone() != null) {
            try {
                String texte = buildSmsTexte(type, utilisateur.getPrenom(), message);
                if (texte != null) {
                    smsService.envoyer(utilisateur.getTelephone(), texte);
                }
            } catch (Exception e) {
                log.error("Erreur lors de la préparation du SMS pour {} : {}", utilisateur.getTelephone(), e.getMessage(), e);
            }
        }
    }

    @Transactional
    public void notifierAdmins(TypeNotification type, String titre, String message, Reservation reservation) {
        utilisateurRepository.findAllAdmins()
                .forEach(u -> creerNotification(u, type, titre, message, reservation));
    }

    @Transactional
    public void notifierGerantsCentre(Long centreId, TypeNotification type, String titre,
                                      String message, Reservation reservation) {
        List<Utilisateur> gerants = utilisateurRepository.findGerantsByCentreId(centreId);
        if (gerants.isEmpty()) {
            log.warn("Aucun gérant actif trouvé pour le centre id={} lors de la notification type={}", centreId, type);
        }
        gerants.forEach(u -> creerNotification(u, type, titre, message, reservation));
    }

    private String buildEmailHtml(TypeNotification type, String prenom, Reservation r, String message) {
        String chambre = r != null && r.getChambre() != null ? r.getChambre().getNumero() : "";
        String centre = r != null && r.getChambre() != null && r.getChambre().getCentre() != null
                ? r.getChambre().getCentre().getNom() : "";
        String arrivee = r != null && r.getDateArrivee() != null
                ? r.getDateArrivee().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
        String depart = r != null && r.getDateDepart() != null
                ? r.getDateDepart().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
        double montant = r != null && r.getMontantTotal() != null ? r.getMontantTotal().doubleValue() : 0;

        return switch (type) {
            case NOUVELLE_RESERVATION -> emailService.reservationCreeeHtml(prenom, chambre, centre, arrivee, depart, montant);
            case RESERVATION_VALIDEE -> emailService.reservationValideeHtml(prenom, chambre, centre);
            case RESERVATION_REFUSEE -> emailService.reservationRefuseeHtml(prenom, chambre);
            case RESERVATION_ANNULEE -> emailService.reservationAnnuleeHtml(prenom, chambre);
            case COMPTE_APPROUVE -> emailService.compteApprouveHtml(prenom);
            case COMPTE_REJETE -> {
                String motif = "Non spécifié";
                if (message != null && message.contains("Motif : ")) {
                    motif = message.substring(message.indexOf("Motif : ") + 8);
                } else if (message != null) {
                    motif = message;
                }
                yield emailService.compteRejeteHtml(prenom, motif);
            }
            case NOUVELLE_DEMANDE_INSCRIPTION -> null;
            default -> null;
        };
    }

    private String buildSmsTexte(TypeNotification type, String prenom, String message) {
        return switch (type) {
            case NOUVELLE_RESERVATION -> "CMT: " + message;
            case RESERVATION_VALIDEE -> "CMT: " + message;
            case RESERVATION_REFUSEE -> "CMT: " + message;
            case RESERVATION_ANNULEE -> "CMT: " + message;
            case COMPTE_APPROUVE -> "CMT: " + message;
            case COMPTE_REJETE -> "CMT: " + message;
            default -> null;
        };
    }
}
