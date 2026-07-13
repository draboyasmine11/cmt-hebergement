package com.sonabel.cmt.repository;

import com.sonabel.cmt.entity.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    List<Signalement> findByUtilisateurIdOrderByCreatedAtDesc(Long utilisateurId);
    List<Signalement> findAllByOrderByCreatedAtDesc();
}
