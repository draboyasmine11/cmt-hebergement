package com.sonabel.cmt.service;

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

    @Value("${cmt.notification.sms.api-url}")
    private String apiUrl;

    @Value("${cmt.notification.sms.api-key}")
    private String apiKey;

    @Value("${cmt.notification.sms.sender}")
    private String sender;

    @Async
    public void envoyer(String telephone, String message) {
        if (!enabled || apiKey == null || apiKey.isBlank()) {
            log.info("[SMS simulé] À {} : {}", telephone, message);
            return;
        }
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
            log.info("SMS envoyé à {}", telephone);
        } catch (Exception e) {
            log.error("Erreur envoi SMS à {} : {}", telephone, e.getMessage());
        }
    }
}
