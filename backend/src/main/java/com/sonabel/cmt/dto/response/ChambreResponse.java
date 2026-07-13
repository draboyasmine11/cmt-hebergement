package com.sonabel.cmt.dto.response;

import com.sonabel.cmt.enums.StatutChambre;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class ChambreResponse {

    private Long id;
    private String numero;
    private String image;
    private BigDecimal prixParNuit;
    private StatutChambre statut;
    private Long centreId;
    private String centreNom;
    private String centreVille;
    private Boolean disponible;
    private String clientNom;
    private LocalDate dateArrivee;
    private LocalDate dateDepart;
}
