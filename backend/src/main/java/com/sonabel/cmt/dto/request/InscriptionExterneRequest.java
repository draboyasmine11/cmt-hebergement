package com.sonabel.cmt.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class InscriptionExterneRequest {

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
    private String adresse;

    @NotBlank
    private String typePiece;

    @NotBlank
    private String numeroPiece;

    private String dateEmissionCnib;

    @NotBlank @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String motDePasse;

    private String fichierJustificatif;
}
