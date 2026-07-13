package com.sonabel.cmt.repository;

import com.sonabel.cmt.entity.Role;
import com.sonabel.cmt.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByNom(RoleType nom);

    Set<Role> findByNomIn(Set<RoleType> noms);

    long countByPermissionsId(Long permissionId);
}
