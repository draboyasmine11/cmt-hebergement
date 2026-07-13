package com.sonabel.cmt.repository;

import com.sonabel.cmt.entity.Centre;
import com.sonabel.cmt.enums.StatutCentre;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CentreRepository extends JpaRepository<Centre, Long> {

    @EntityGraph(attributePaths = {"chambres"})
    List<Centre> findAll();

    @EntityGraph(attributePaths = {"chambres"})
    List<Centre> findByStatut(StatutCentre statut);

    @EntityGraph(attributePaths = {"chambres"})
    List<Centre> findByVilleContainingIgnoreCase(String ville);

    Optional<Centre> findByNom(String nom);
}
