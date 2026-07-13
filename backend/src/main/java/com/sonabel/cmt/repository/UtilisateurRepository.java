package com.sonabel.cmt.repository;

import com.sonabel.cmt.entity.Utilisateur;
import com.sonabel.cmt.enums.StatutCompte;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    @Query("SELECT u FROM Utilisateur u WHERE u.deletedAt IS NULL")
    List<Utilisateur> findAllActifs();

    @Query("SELECT COUNT(u) FROM Utilisateur u WHERE u.deletedAt IS NULL")
    long countActifs();

    @Query("SELECT u FROM Utilisateur u WHERE u.id = :id AND u.deletedAt IS NULL")
    Optional<Utilisateur> findActifById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"roles", "centre"})
    Optional<Utilisateur> findByEmail(String email);

    @EntityGraph(attributePaths = {"roles", "centre"})
    Optional<Utilisateur> findByUsername(String username);

    @Query("SELECT COUNT(u) > 0 FROM Utilisateur u WHERE u.email = :email AND u.deletedAt IS NULL")
    boolean existsByEmail(@Param("email") String email);

    @Query("SELECT COUNT(u) > 0 FROM Utilisateur u WHERE u.username = :username AND u.deletedAt IS NULL")
    boolean existsByUsername(@Param("username") String username);

    @Query("SELECT COUNT(u) > 0 FROM Utilisateur u WHERE u.matricule = :matricule AND u.deletedAt IS NULL")
    boolean existsByMatricule(@Param("matricule") String matricule);

    Optional<Utilisateur> findFirstByCentreIdAndRolesNom(Long centreId, com.sonabel.cmt.enums.RoleType roleNom);

    @Query("SELECT DISTINCT u FROM Utilisateur u JOIN FETCH u.roles r WHERE r.nom = com.sonabel.cmt.enums.RoleType.GERANT AND u.centre IS NOT NULL AND u.centre.id = :centreId AND u.deletedAt IS NULL AND u.actif = true")
    List<Utilisateur> findGerantsByCentreId(@Param("centreId") Long centreId);

    @Query("SELECT DISTINCT u FROM Utilisateur u JOIN FETCH u.roles r WHERE r.nom = com.sonabel.cmt.enums.RoleType.ADMIN AND u.deletedAt IS NULL AND u.actif = true")
    List<Utilisateur> findAllAdmins();

    @Query("SELECT COUNT(u) FROM Utilisateur u JOIN u.roles r WHERE r.id = :roleId AND u.deletedAt IS NULL")
    long countByRolesId(@Param("roleId") Long roleId);

    @Query("""
            SELECT u FROM Utilisateur u
            WHERE u.deletedAt IS NULL
            AND (
                LOWER(u.nom) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(u.prenom) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(u.telephone) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%'))
            )
            """)
    List<Utilisateur> searchActifs(@Param("q") String q);

    List<Utilisateur> findByStatutCompteAndDeletedAtIsNullOrderByCreatedAtDesc(StatutCompte statutCompte);

    @Query("SELECT u FROM Utilisateur u WHERE u.centre = :centre AND u.statutCompte = :statut AND u.deletedAt IS NULL ORDER BY u.createdAt DESC")
    List<Utilisateur> findByCentreAndStatutCompte(@Param("centre") com.sonabel.cmt.entity.Centre centre, @Param("statut") StatutCompte statutCompte);
}
