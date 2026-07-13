package com.sonabel.cmt.repository;

import com.sonabel.cmt.entity.TypeClientConfig;
import com.sonabel.cmt.enums.TypeClient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TypeClientConfigRepository extends JpaRepository<TypeClientConfig, Long> {
    Optional<TypeClientConfig> findByTypeClient(TypeClient typeClient);
}
