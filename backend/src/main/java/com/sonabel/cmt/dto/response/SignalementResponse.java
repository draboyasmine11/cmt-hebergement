package com.sonabel.cmt.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SignalementResponse {
    private Long id;
    private String sujet;
    private String description;
    private String statut;
    private String emailContact;
    private String telephoneContact;
    private Long utilisateurId;
    private String utilisateurNom;
    private LocalDateTime createdAt;
    private LocalDateTime traiteAt;
}
