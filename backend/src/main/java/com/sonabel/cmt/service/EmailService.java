package com.sonabel.cmt.service;

import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${cmt.notification.email.from}")
    private String from;

    @Value("${cmt.notification.email.support}")
    private String supportEmail;

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

    @Async
    public void envoyer(String to, String sujet, String contenuHtml) {
        if (mailPassword == null || mailPassword.isBlank()) {
            log.warn("Envoi d'email ignoré (MAIL_PASSWORD non configuré/vide). Destinataire: {}, Sujet: {}", to, sujet);
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

    @Async
    public void envoyerSupport(String sujet, String contenuHtml) {
        envoyer(supportEmail, "[CMT Support] " + sujet, contenuHtml);
    }

    public String reservationCreeeHtml(String prenom, String chambreNumero, String centreNom, String arrivee, String depart, double montant) {
        return """
            <html><body style="font-family: Arial, sans-serif;">
            <div style="max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px;">
                <h2 style="color:#00529B;">Nouvelle réservation</h2>
                <p>Bonjour <strong>%s</strong>,</p>
                <p>Votre réservation a été créée et est en attente de validation.</p>
                <table style="width:100%%;border-collapse:collapse;margin:16px 0;">
                    <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">Chambre</td><td style="padding:8px;">%s</td></tr>
                    <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">Centre</td><td style="padding:8px;">%s</td></tr>
                    <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">Arrivée</td><td style="padding:8px;">%s</td></tr>
                    <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">Départ</td><td style="padding:8px;">%s</td></tr>
                    <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">Montant</td><td style="padding:8px;">%s FCFA</td></tr>
                </table>
                <p style="color:#6b7280;font-size:13px;">Équipe CMT-SONABEL</p>
            </div></body></html>
            """.formatted(prenom, chambreNumero, centreNom, arrivee, depart, String.format("%,.0f", montant));
    }

    public String reservationValideeHtml(String prenom, String chambreNumero, String centreNom) {
        return blocSimple(prenom, "Réservation validée", "Votre réservation pour la chambre <strong>%s</strong> au <strong>%s</strong> a été validée. Bon séjour !".formatted(chambreNumero, centreNom));
    }

    public String reservationRefuseeHtml(String prenom, String chambreNumero) {
        return blocSimple(prenom, "Réservation refusée", "Votre réservation pour la chambre <strong>%s</strong> a été refusée. Veuillez contacter le centre pour plus d'informations.".formatted(chambreNumero));
    }

    public String reservationAnnuleeHtml(String prenom, String chambreNumero) {
        return blocSimple(prenom, "Réservation annulée", "Votre réservation pour la chambre <strong>%s</strong> a été annulée.".formatted(chambreNumero));
    }

    public String compteApprouveHtml(String prenom) {
        return """
            <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; padding: 20px; margin: 0;">
                <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 5px solid #28a745;">
                    <div style="padding: 30px; text-align: center; background-color: #f8fff9;">
                        <div style="font-size: 50px; color: #28a745; margin-bottom: 10px;">✓</div>
                        <h2 style="color: #00529B; margin: 0; font-size: 24px;">Compte Activé</h2>
                    </div>
                    <div style="padding: 30px; color: #333333; line-height: 1.6;">
                        <p>Bonjour <strong>%s</strong>,</p>
                        <p>Nous avons le plaisir de vous informer que votre compte d'accès à la plateforme de gestion des centres d'hébergement <strong>CMT-SONABEL</strong> a été approuvé et activé par l'administrateur.</p>
                        <p>Vous pouvez dès à présent vous connecter en utilisant vos identifiants pour effectuer vos demandes de réservation.</p>
                        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                        <p style="font-size: 12px; color: #777777; text-align: center; margin-bottom: 0;">
                            Ceci est un message automatique, merci de ne pas y répondre.<br>
                            Service Social - CMT SONABEL
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(prenom);
    }

    public String compteRejeteHtml(String prenom, String motif) {
        return """
            <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; padding: 20px; margin: 0;">
                <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 5px solid #dc3545;">
                    <div style="padding: 30px; text-align: center; background-color: #fffafb;">
                        <div style="font-size: 50px; color: #dc3545; margin-bottom: 10px;">✕</div>
                        <h2 style="color: #00529B; margin: 0; font-size: 24px;">Demande d'inscription rejetée</h2>
                    </div>
                    <div style="padding: 30px; color: #333333; line-height: 1.6;">
                        <p>Bonjour <strong>%s</strong>,</p>
                        <p>Après examen de votre dossier, nous regrettons de vous informer que votre demande d'inscription sur la plateforme <strong>CMT-SONABEL</strong> a été rejetée.</p>
                        <div style="background-color: #fff8f8; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <strong style="color: #c0392b; display: block; margin-bottom: 5px;">Motif du rejet :</strong>
                            <span style="color: #555555;">%s</span>
                        </div>
                        <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez soumettre à nouveau votre dossier avec les informations requises, veuillez contacter notre équipe d'assistance.</p>
                        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                        <p style="font-size: 12px; color: #777777; text-align: center; margin-bottom: 0;">
                            Ceci est un message automatique, merci de ne pas y répondre.<br>
                            Service Social - CMT SONABEL
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(prenom, motif != null && !motif.isBlank() ? motif : "Non spécifié");
    }

    public String signalementRecuHtml(String objet, String description, String email) {
        return """
            <html><body style="font-family: Arial, sans-serif;">
            <div style="max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px;">
                <h2 style="color:#00529B;">Nouveau signalement</h2>
                <p><strong>Objet :</strong> %s</p>
                <p><strong>De :</strong> %s</p>
                <p><strong>Description :</strong></p>
                <p style="background:#f8f9fa;padding:12px;border-radius:8px;">%s</p>
            </div></body></html>
            """.formatted(objet, email, description);
    }

    private String blocSimple(String prenom, String titre, String message) {
        return """
            <html><body style="font-family: Arial, sans-serif;">
            <div style="max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px;">
                <h2 style="color:#00529B;">%s</h2>
                <p>Bonjour <strong>%s</strong>,</p>
                <p>%s</p>
                <p style="color:#6b7280;font-size:13px;">Équipe CMT-SONABEL</p>
            </div></body></html>
            """.formatted(titre, prenom, message);
    }
}
