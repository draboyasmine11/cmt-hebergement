package com.sonabel.cmt.dto.response;

import com.sonabel.cmt.enums.ModePaiement;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PaiementResponse {

    private Long id;
    private BigDecimal montant;
    private LocalDateTime datePaiement;
    private ModePaiement modePaiement;
    private String reference;
    private Long reservationId;
    private String clientNom;
    private String chambreNumero;
    private String chambreType;
    private LocalDate dateSortieReelle;
}
