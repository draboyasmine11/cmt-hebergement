package com.sonabel.cmt.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class StatistiquesResponse {

    private Long totalCentres;
    private Long totalChambres;
    private Long chambresDisponibles;
    private Long chambresOccupees;
    private Long reservationsMois;
    private Long totalReservations;
    private Long totalUtilisateurs;
    private Double tauxOccupation;
    private BigDecimal revenusGeneres;
    private List<Map<String, Object>> reservationsParMois;
    private List<Map<String, Object>> revenusMensuels;
    private List<Map<String, Object>> tauxOccupationMensuel;
    private List<Map<String, Object>> reservationsParCentre;
    private List<Map<String, Object>> revenusParCentre;
}
