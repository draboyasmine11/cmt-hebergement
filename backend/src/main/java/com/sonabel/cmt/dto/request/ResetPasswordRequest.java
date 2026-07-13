package com.sonabel.cmt.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    /** Si null ou vide, un mot de passe aléatoire est généré. */
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String nouveauMotDePasse;

    private boolean genererAleatoire = true;
}
