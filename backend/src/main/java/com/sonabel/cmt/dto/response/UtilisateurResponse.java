package com.sonabel.cmt.dto.response;

import com.sonabel.cmt.enums.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class UtilisateurResponse {

    private Long id;
    private String nom;
    private String prenom;
    private Sexe sexe;
    private String email;
    private String username;
    private String telephone;
    private String adresse;
    private String photoUrl;
    private String matricule;
    private String fonction;
    private NiveauAcces niveauAcces;
    private TypeClient typeClient;
    private StatutCompte statutCompte;
    private LocalDate dateNaissance;
    private LocalDate dateDepartRetraite;
    private BigDecimal tauxReduction;
    private String motifRejet;
    private String fichierJustificatif;
    private String direction;
    private String service;
    private TypePieceIdentite typePiece;
    private String numeroPiece;
    private String nationalite;
    private String profession;
    private Boolean actif;
    private Long centreId;
    private String centreNom;
    private Set<String> roles;
    private RoleType typeUtilisateur;
    private LocalDateTime createdAt;
    /** Renvoyé uniquement à la création ou réinitialisation */
    private String motDePasseTemporaire;
}
