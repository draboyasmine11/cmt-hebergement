package com.sonabel.cmt.dto.response;

import com.sonabel.cmt.enums.StatutCentre;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CentreResponse {

    private Long id;
    private String nom;
    private String ville;
    private String adresse;
    private String telephone;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String description;
    private String image;
    private StatutCentre statut;
    private Long nombreChambres;
    private Long chambresDisponibles;
    private Double distanceKm;
    private Long gerantId;
    private String gerantNom;
    private String gerantTelephone;
}
