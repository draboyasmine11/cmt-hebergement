package com.sonabel.cmt.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class InscriptionRetraiteRequest {

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @NotBlank
    private String sexe;

    private LocalDate dateNaissance;

    @NotBlank
    private String telephone;

    @NotBlank @Email
    private String email;

    @NotBlank
    @Pattern(regexp = "^\\d{4,5}[A-Za-z]$", message = "Le matricule doit comporter 4 ou 5 chiffres suivis d'une lettre")
    private String matricule;

    private LocalDate dateDepartRetraite;

    @NotBlank @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String motDePasse;

    private String fichierJustificatif;
}
