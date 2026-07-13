package com.sonabel.cmt.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InscriptionRequest {

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @NotBlank
    private String sexe;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String telephone;

    private String matricule;

    @NotBlank
    private String motDePasse;
}
