package com.sonabel.cmt.repository;

import com.sonabel.cmt.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {

    Optional<Paiement> findByReservationId(Long reservationId);

    List<Paiement> findByReservationUtilisateurIdOrderByDatePaiementDesc(Long utilisateurId);

    List<Paiement> findByReservationChambreCentreIdOrderByDatePaiementDesc(Long centreId);

    @Query("SELECT COALESCE(SUM(p.montant), 0) FROM Paiement p")
    BigDecimal sumMontantTotal();

    @Query("""
            SELECT MONTH(p.datePaiement), YEAR(p.datePaiement), SUM(p.montant)
            FROM Paiement p
            GROUP BY YEAR(p.datePaiement), MONTH(p.datePaiement)
            ORDER BY YEAR(p.datePaiement), MONTH(p.datePaiement)
            """)
    List<Object[]> sumByMonth();

    @Query("""
            SELECT c.nom, COALESCE(SUM(p.montant), 0)
            FROM Paiement p
            JOIN p.reservation r
            JOIN r.chambre ch
            JOIN ch.centre c
            GROUP BY c.nom
            ORDER BY SUM(p.montant) DESC
            """)
    List<Object[]> sumByCentre();
}
