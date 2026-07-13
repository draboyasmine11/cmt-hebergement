package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.request.LoginRequest;
import com.sonabel.cmt.dto.response.AuthResponse;
import com.sonabel.cmt.entity.Utilisateur;
import com.sonabel.cmt.security.CustomUserDetails;
import com.sonabel.cmt.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final com.sonabel.cmt.repository.UtilisateurRepository utilisateurRepository;
    private final com.sonabel.cmt.repository.RoleRepository roleRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse()));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Utilisateur utilisateur = userDetails.getUtilisateur();

        if (utilisateur.getStatutCompte() == com.sonabel.cmt.enums.StatutCompte.REJETE) {
            throw new com.sonabel.cmt.exception.BusinessException(
                    "Votre compte a été rejeté. Motif : " + (utilisateur.getMotifRejet() != null ? utilisateur.getMotifRejet() : "Non spécifié"));
        }

        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .id(utilisateur.getId())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .email(utilisateur.getEmail())
                .roles(utilisateur.getRoles().stream()
                        .map(r -> r.getNom().name())
                        .collect(Collectors.toSet()))
                .centreId(utilisateur.getCentre() != null ? utilisateur.getCentre().getId() : null)
                .matricule(utilisateur.getMatricule())
                .statutCompte(utilisateur.getStatutCompte())
                .typeClient(utilisateur.getTypeClient())
                .tauxReduction(utilisateur.getTauxReduction())
                .build();
    }

    @org.springframework.transaction.annotation.Transactional
    public com.sonabel.cmt.dto.response.UtilisateurResponse register(com.sonabel.cmt.dto.request.InscriptionRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new com.sonabel.cmt.exception.BusinessException("Cet email est déjà utilisé");
        }
        if (request.getMatricule() != null && !request.getMatricule().isBlank()) {
            if (utilisateurRepository.existsByMatricule(request.getMatricule())) {
                throw new com.sonabel.cmt.exception.BusinessException("Ce matricule est déjà utilisé");
            }
            if (!request.getMatricule().matches("^\\d{1,5}[A-Za-z]$")) {
                throw new com.sonabel.cmt.exception.BusinessException("Le matricule doit comporter au maximum 5 chiffres suivis d'une lettre à la fin.");
            }
        }

        com.sonabel.cmt.entity.Role clientRole = roleRepository.findByNom(com.sonabel.cmt.enums.RoleType.CLIENT)
                .orElseThrow(() -> new com.sonabel.cmt.exception.ResourceNotFoundException("Rôle CLIENT introuvable"));

        boolean isAgent = request.getMatricule() != null && !request.getMatricule().isBlank();
        com.sonabel.cmt.enums.StatutCompte statutCompte = isAgent
                ? com.sonabel.cmt.enums.StatutCompte.EN_ATTENTE
                : com.sonabel.cmt.enums.StatutCompte.ACTIF;
        boolean actif = !isAgent;

        String username = request.getEmail().split("@")[0];
        // Ensure unique username
        if (utilisateurRepository.existsByUsername(username)) {
            username = username + "_" + System.currentTimeMillis();
        }

        com.sonabel.cmt.entity.Utilisateur utilisateur = com.sonabel.cmt.entity.Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .sexe(com.sonabel.cmt.enums.Sexe.valueOf(request.getSexe()))
                .email(request.getEmail())
                .username(username)
                .telephone(request.getTelephone())
                .matricule(isAgent ? request.getMatricule() : null)
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .actif(actif)
                .statutCompte(statutCompte)
                .roles(new java.util.HashSet<>(java.util.Set.of(clientRole)))
                .build();

        return com.sonabel.cmt.mapper.EntityMapper.toUtilisateurResponse(utilisateurRepository.save(utilisateur));
    }
}
