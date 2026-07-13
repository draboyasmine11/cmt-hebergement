package com.sonabel.cmt.dto.response;

import com.sonabel.cmt.enums.StatutReservation;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ReservationResponse {

    private Long id;
    private LocalDateTime dateReservation;
    private LocalDate dateArrivee;
    private LocalDate dateDepart;
    private LocalDate dateSortieReelle;
    private StatutReservation statut;
    private BigDecimal montantTotal;
    private Long utilisateurId;
    private String utilisateurNom;
    private Long chambreId;
    private String chambreNumero;
    private Long centreId;
    private String centreNom;
    private String chambreType;
    private Boolean payee;
    private String motifRejet;
}
