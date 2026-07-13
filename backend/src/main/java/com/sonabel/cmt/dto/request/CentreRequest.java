package com.sonabel.cmt.dto.request;

import com.sonabel.cmt.enums.StatutCentre;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CentreRequest {

    @NotBlank
    private String nom;

    @NotBlank
    private String ville;

    @NotBlank
    private String adresse;

    @NotBlank
    private String telephone;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @NotBlank
    private String description;

    private String image; // optionnel

    private Long gerantId;

    @NotNull
    private StatutCentre statut = StatutCentre.ACTIF;
}
