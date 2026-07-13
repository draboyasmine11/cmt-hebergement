package com.sonabel.cmt.dto.request;

import com.sonabel.cmt.enums.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UtilisateurRequest {

    @NotNull(message = "Le type utilisateur est obligatoire")
    private RoleType typeUtilisateur;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotNull(message = "Le sexe est obligatoire")
    private Sexe sexe;

    @NotBlank(message = "Le téléphone est obligatoire")
    private String telephone;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    private String adresse;
    private String photoUrl;

    @Size(min = 3, max = 100)
    private String username;

    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String motDePasse;

    private String confirmationMotDePasse;

    private Boolean actif = true;

    /** Gérant uniquement */
    private Long centreId;

    /** Admin / Gérant */
    private String matricule;
    private String fonction;
    private NiveauAcces niveauAcces;

    /** Client */
    private TypeClient typeClient;
    private String direction;
    private String service;
    private TypePieceIdentite typePiece;
    private String numeroPiece;
    private String nationalite;
    private String profession;

    /** Générer un mot de passe aléatoire côté serveur si true et motDePasse vide */
    private boolean genererMotDePasse = false;
}
