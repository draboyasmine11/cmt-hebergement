package com.sonabel.cmt.dto.response;

import com.sonabel.cmt.enums.*;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class DemandeInscriptionResponse {

    private Long id;
    private String nom;
    private String prenom;
    private Sexe sexe;
    private LocalDate dateNaissance;
    private String email;
    private String telephone;
    private String adresse;
    private String matricule;
    private String direction;
    private String service;
    private String fonction;
    private LocalDate dateDepartRetraite;
    private TypeClient typeClient;
    private StatutCompte statutCompte;
    private String typePiece;
    private String numeroPiece;
    private String username;
    private String fichierJustificatif;
    private String motifRejet;
    private BigDecimal tauxReduction;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
