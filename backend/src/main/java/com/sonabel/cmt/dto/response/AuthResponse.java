package com.sonabel.cmt.dto.response;

import com.sonabel.cmt.enums.StatutCompte;
import com.sonabel.cmt.enums.TypeClient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private Set<String> roles;
    private Long centreId;
    private String matricule;
    private StatutCompte statutCompte;
    private TypeClient typeClient;
    private BigDecimal tauxReduction;
}
