package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.response.StatistiquesResponse;
import com.sonabel.cmt.enums.StatutChambre;

import com.sonabel.cmt.repository.ChambreRepository;
import com.sonabel.cmt.repository.CentreRepository;
import com.sonabel.cmt.repository.PaiementRepository;
import com.sonabel.cmt.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatistiquesService {

    private final CentreRepository centreRepository;
    private final ChambreRepository chambreRepository;
    private final ReservationRepository reservationRepository;
    private final PaiementRepository paiementRepository;
    private final com.sonabel.cmt.repository.UtilisateurRepository utilisateurRepository;

    public StatistiquesResponse getStatistiques() {
        long totalCentres = centreRepository.count();
        long totalChambres = chambreRepository.count();
        long chambresDisponibles = chambreRepository.countByStatut(StatutChambre.DISPONIBLE);
        long chambresOccupees = chambreRepository.countByStatut(StatutChambre.OCCUPEE);

        LocalDateTime debutMois = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime finMois = debutMois.plusMonths(1);
        long reservationsMois = reservationRepository.countReservationsBetween(debutMois, finMois);

        double tauxOccupation = totalChambres > 0
                ? (chambresOccupees * 100.0) / totalChambres
                : 0.0;

        BigDecimal revenus = paiementRepository.sumMontantTotal();

        long totalReservations = reservationRepository.count();
        long totalUtilisateurs = utilisateurRepository.countActifs();

        return StatistiquesResponse.builder()
                .totalCentres(totalCentres)
                .totalChambres(totalChambres)
                .chambresDisponibles(chambresDisponibles)
                .chambresOccupees(chambresOccupees)
                .reservationsMois(reservationsMois)
                .totalReservations(totalReservations)
                .totalUtilisateurs(totalUtilisateurs)
                .tauxOccupation(Math.round(tauxOccupation * 100.0) / 100.0)
                .revenusGeneres(revenus)
                .reservationsParMois(mapReservationsParMois())
                .revenusMensuels(mapRevenusMensuels())
                .tauxOccupationMensuel(List.of())
                .reservationsParCentre(mapReservationsParCentre())
                .revenusParCentre(mapRevenusParCentre())
                .build();
    }

    private List<Map<String, Object>> mapReservationsParMois() {
        return reservationRepository.countByMonth().stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("mois", row[0]);
                    map.put("annee", row[1]);
                    map.put("total", row[2]);
                    return map;
                })
                .toList();
    }

    private List<Map<String, Object>> mapRevenusMensuels() {
        return paiementRepository.sumByMonth().stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("mois", row[0]);
                    map.put("annee", row[1]);
                    map.put("montant", row[2]);
                    return map;
                })
                .toList();
    }

    private List<Map<String, Object>> mapReservationsParCentre() {
        return reservationRepository.countValideesByCentre().stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("nom", row[0]);
                    map.put("total", row[1]);
                    return map;
                })
                .toList();
    }

    private List<Map<String, Object>> mapRevenusParCentre() {
        return paiementRepository.sumByCentre().stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("nom", row[0]);
                    map.put("montant", row[1]);
                    return map;
                })
                .toList();
    }
}
