package com.sonabel.cmt.repository;

import com.sonabel.cmt.entity.Tarif;
import com.sonabel.cmt.enums.TypeClient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TarifRepository extends JpaRepository<Tarif, Long> {

    Optional<Tarif> findByCentreIdAndTypeClient(Long centreId, TypeClient typeClient);

    List<Tarif> findByCentreId(Long centreId);
}
