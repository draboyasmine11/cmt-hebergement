package com.sonabel.cmt.dto.request;

import com.sonabel.cmt.enums.ModePaiement;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaiementRequest {

    @NotNull
    @Positive
    private BigDecimal montant;

    @NotNull
    private ModePaiement modePaiement;

    private String reference;

    @NotNull
    private Long reservationId;

    private LocalDate dateSortieReelle;
}
