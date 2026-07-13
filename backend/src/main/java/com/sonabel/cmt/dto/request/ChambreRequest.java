package com.sonabel.cmt.dto.request;

import com.sonabel.cmt.enums.StatutChambre;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ChambreRequest {

    @NotBlank
    private String numero;

    private String type;

    private Integer capacite;

    private String image;

    @NotNull
    @Positive
    private BigDecimal prixParNuit;

    @NotNull
    private StatutChambre statut = StatutChambre.DISPONIBLE;

    @NotNull
    private Long centreId;
}
