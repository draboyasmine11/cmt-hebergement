package com.sonabel.cmt.service;

import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

import java.io.ByteArrayInputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${cmt.notification.email.from}")
    private String from;

    @Value("${cmt.notification.email.support}")
    private String supportEmail;

    @Value("${cmt.app.url:}")
    private String appUrl;

    @PostConstruct
    void verifierConfiguration() {
        if (mailPassword == null || mailPassword.isBlank()) {
            log.warn("══════════════════════════════════════════════════════════════");
            log.warn(" MAIL_PASSWORD non configuré — les emails ne seront PAS envoyés.");
            log.warn(" Définissez la variable d'environnement MAIL_PASSWORD ou");
            log.warn(" modifiez spring.mail.password dans application.yml.");
            log.warn("══════════════════════════════════════════════════════════════");
        }
    }

    public void envoyer(String to, String sujet, String contenuHtml) {
        if (mailPassword == null || mailPassword.isBlank()) {
            log.warn("Envoi d'email ignoré (MAIL_PASSWORD non configuré). Destinataire: {}, Sujet: {}", to, sujet);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(sujet);
            helper.setText(contenuHtml, true);
            mailSender.send(message);
            log.info("Email envoyé à {}", to);
        } catch (Exception e) {
            log.error("Erreur envoi email à {} : {}", to, e.getMessage(), e);
            throw new RuntimeException("Échec de l'envoi de l'email à " + to, e);
        }
    }

    public void envoyerAvecPieceJointe(String to, String sujet, String contenuHtml,
                                        String nomFichier, byte[] fichier) {
        if (mailPassword == null || mailPassword.isBlank()) {
            log.warn("Envoi d'email avec pièce jointe ignoré (MAIL_PASSWORD non configuré). Destinataire: {}", to);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(sujet);
            helper.setText(contenuHtml, true);
            if (fichier != null && nomFichier != null) {
                helper.addAttachment(nomFichier, () -> new ByteArrayInputStream(fichier));
            }
            mailSender.send(message);
            log.info("Email avec pièce jointe envoyé à {}", to);
        } catch (Exception e) {
            log.error("Erreur envoi email avec pièce jointe à {} : {}", to, e.getMessage(), e);
            throw new RuntimeException("Échec de l'envoi de l'email avec pièce jointe à " + to, e);
        }
    }

    @Async
    public void envoyerSupport(String sujet, String contenuHtml) {
        envoyer(supportEmail, "[CMT Support] " + sujet, contenuHtml);
    }

    public String reservationCreeeHtml(String prenom, String chambreNumero, String centreNom,
                                        String arrivee, String depart, double montant) {
        return render("email/reservation-creee", Map.of(
            "prenom", prenom,
            "chambre", chambreNumero,
            "centre", centreNom,
            "arrivee", arrivee,
            "depart", depart,
            "montant", String.format("%,.0f", montant)
        ));
    }

    public String reservationValideeHtml(String prenom, String chambreNumero, String centreNom,
                                          String arrivee, String depart, double montant) {
        return render("email/reservation-validee", Map.of(
            "prenom", prenom,
            "chambre", chambreNumero,
            "centre", centreNom,
            "arrivee", arrivee,
            "depart", depart,
            "montant", String.format("%,.0f", montant)
        ));
    }

    public String reservationRefuseeHtml(String prenom, String chambreNumero, String centreNom,
                                          String arrivee, String depart, String motif) {
        return render("email/reservation-refusee", Map.of(
            "prenom", prenom,
            "chambre", chambreNumero,
            "centre", centreNom,
            "arrivee", arrivee,
            "depart", depart,
            "motif", motif != null ? motif : "Non spécifié"
        ));
    }

    public String reservationAnnuleeHtml(String prenom, String chambreNumero) {
        return render("email/reservation-annulee", Map.of(
            "prenom", prenom,
            "chambre", chambreNumero
        ));
    }

    public String compteApprouveHtml(String prenom) {
        return render("email/compte-approuve", Map.of(
            "prenom", prenom,
            "loginUrl", appUrl
        ));
    }

    public String compteRejeteHtml(String prenom, String motif) {
        return render("email/compte-rejete", Map.of(
            "prenom", prenom,
            "motif", motif != null && !motif.isBlank() ? motif : "Non spécifié"
        ));
    }

    public String nouvelleDemandeInscriptionHtml(String prenom, String nom, String email, String telephone) {
        return render("email/nouvelle-demande-inscription", Map.of(
            "prenom", prenom,
            "nom", nom,
            "email", email,
            "telephone", telephone != null ? telephone : ""
        ));
    }

    public String paiementConfirmeHtml(String prenom, String chambreNumero, String centreNom,
                                        String montant, String modePaiement, String reference) {
        return render("email/paiement-confirme", Map.of(
            "prenom", prenom,
            "chambre", chambreNumero,
            "centre", centreNom,
            "montant", montant,
            "modePaiement", modePaiement,
            "reference", reference != null ? reference : "N/A"
        ));
    }

    public String signalementRecuHtml(String objet, String description, String email) {
        return render("email/signalement-recu", Map.of(
            "objet", objet,
            "description", description,
            "email", email
        ));
    }

    private String render(String template, Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);
        return templateEngine.process(template, context);
    }
}
