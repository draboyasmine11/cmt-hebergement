package com.sonabel.cmt.repository;

import com.sonabel.cmt.entity.Chambre;
import com.sonabel.cmt.enums.StatutChambre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChambreRepository extends JpaRepository<Chambre, Long> {

    List<Chambre> findByCentreId(Long centreId);

    List<Chambre> findByCentreIdAndStatut(Long centreId, StatutChambre statut);

    long countByStatut(StatutChambre statut);

    long countByCentreId(Long centreId);
}
