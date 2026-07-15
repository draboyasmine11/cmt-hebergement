package com.sonabel.cmt.repository;

import com.sonabel.cmt.entity.Notification;
import com.sonabel.cmt.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUtilisateurIdOrderByCreatedAtDesc(Long utilisateurId);

    long countByUtilisateurIdAndLuFalse(Long utilisateurId);

    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.chambre c LEFT JOIN FETCH c.centre LEFT JOIN FETCH r.utilisateur LEFT JOIN FETCH r.paiement WHERE r.id = :id")
    Optional<Reservation> findReservationById(@Param("id") Long id);
}
