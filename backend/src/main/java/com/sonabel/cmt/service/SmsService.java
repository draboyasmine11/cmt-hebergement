package com.sonabel.cmt.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class SmsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${cmt.notification.sms.enabled}")
    private boolean enabled;

    @Value("${cmt.notification.sms.provider:generic}")
    private String provider;

    // Generic API
    @Value("${cmt.notification.sms.api-url:}")
    private String apiUrl;

    @Value("${cmt.notification.sms.api-key:}")
    private String apiKey;

    // Twilio
    @Value("${cmt.notification.sms.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${cmt.notification.sms.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${cmt.notification.sms.twilio.from-number:}")
    private String twilioFromNumber;

    @Value("${cmt.notification.sms.sender}")
    private String sender;

    @PostConstruct
    void initTwilio() {
        if (enabled && "twilio".equalsIgnoreCase(provider)
                && !twilioAccountSid.isBlank() && !twilioAuthToken.isBlank()) {
            Twilio.init(twilioAccountSid, twilioAuthToken);
            log.info("Twilio initialisé avec le compte SID: {}...", twilioAccountSid.substring(0, Math.min(6, twilioAccountSid.length())));
        }
    }

    @Async
    public void envoyer(String telephone, String message) {
        if (!enabled) {
            log.info("[SMS désactivé] À {} : {}", telephone, message);
            return;
        }

        String numero = normaliserTelephone(telephone);

        if ("twilio".equalsIgnoreCase(provider) && !twilioAccountSid.isBlank()) {
            envoyerViaTwilio(numero, message);
        } else if (apiKey != null && !apiKey.isBlank()) {
            envoyerViaApiGenerique(numero, message);
        } else {
            log.info("[SMS simulé] À {} : {}", numero, message);
        }
    }

    private void envoyerViaTwilio(String telephone, String message) {
        try {
            Message twilioMessage = Message.creator(
                    new PhoneNumber(telephone),
                    new PhoneNumber(twilioFromNumber),
                    message
            ).create();
            log.info("SMS Twilio envoyé à {} (SID: {})", telephone, twilioMessage.getSid());
        } catch (Exception e) {
            log.error("Erreur envoi SMS Twilio à {} : {}", telephone, e.getMessage());
        }
    }

    private void envoyerViaApiGenerique(String telephone, String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                "to", telephone,
                "from", sender,
                "text", message
            );

            restTemplate.postForEntity(apiUrl, new HttpEntity<>(body, headers), String.class);
            log.info("SMS envoyé via API générique à {}", telephone);
        } catch (Exception e) {
            log.error("Erreur envoi SMS via API générique à {} : {}", telephone, e.getMessage());
        }
    }

    private String normaliserTelephone(String telephone) {
        if (telephone == null) return "";
        String net = telephone.replaceAll("[^0-9+]", "");
        if (net.startsWith("+")) return net;
        if (net.startsWith("0")) return "+226" + net.substring(1);
        return "+226" + net;
    }
}
