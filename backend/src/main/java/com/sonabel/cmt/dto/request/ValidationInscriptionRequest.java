package com.sonabel.cmt.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ValidationInscriptionRequest {

    @NotNull
    private Long utilisateurId;

    @NotBlank
    private String action;

    private String motif;
}
