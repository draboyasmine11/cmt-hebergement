package com.sonabel.cmt.repository;

import com.sonabel.cmt.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUtilisateurIdOrderByDateReservationDesc(Long utilisateurId);

    List<Reservation> findByChambreCentreIdOrderByDateReservationDesc(Long centreId);

    long countByChambreId(Long chambreId);

    @Query("""
            SELECT COUNT(r) FROM Reservation r
            WHERE r.dateReservation >= :debut AND r.dateReservation < :fin
            """)
    long countReservationsBetween(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("""
            SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Reservation r
            WHERE r.chambre.id = :chambreId
            AND r.statut IN ('EN_ATTENTE', 'VALIDEE')
            AND r.paiement IS NULL
            AND r.dateArrivee < :dateDepart
            AND r.dateDepart > :dateArrivee
            AND (:excludeId IS NULL OR r.id <> :excludeId)
            """)
    boolean existsChevauchement(
            @Param("chambreId") Long chambreId,
            @Param("dateArrivee") LocalDate dateArrivee,
            @Param("dateDepart") LocalDate dateDepart,
            @Param("excludeId") Long excludeId);

    @Query("""
            SELECT MONTH(r.dateReservation) as mois, YEAR(r.dateReservation) as annee, COUNT(r) as total
            FROM Reservation r
            GROUP BY YEAR(r.dateReservation), MONTH(r.dateReservation)
            ORDER BY annee, mois
            """)
    List<Object[]> countByMonth();

    @Query("""
            SELECT c.nom, COUNT(r.id)
            FROM Reservation r JOIN r.chambre ch JOIN ch.centre c
            WHERE r.statut = 'VALIDEE'
            GROUP BY c.id, c.nom
            ORDER BY COUNT(r.id) DESC
            """)
    List<Object[]> countValideesByCentre();

    @Query("""
            SELECT r FROM Reservation r
            WHERE r.chambre.id = :chambreId
            AND r.statut = 'VALIDEE'
            AND r.dateArrivee <= :aujourdhui
            AND r.dateDepart >= :aujourdhui
            ORDER BY r.dateArrivee DESC
            """)
    List<Reservation> findActiveByChambreId(@Param("chambreId") Long chambreId, @Param("aujourdhui") LocalDate aujourdhui);

    @Query("""
            SELECT r FROM Reservation r
            JOIN FETCH r.chambre ch
            JOIN FETCH ch.centre
            JOIN FETCH r.utilisateur
            WHERE r.id = :id
            """)
    java.util.Optional<Reservation> findByIdWithDetails(@Param("id") Long id);
}
