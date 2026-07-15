package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.request.InscriptionAgentRequest;
import com.sonabel.cmt.dto.request.InscriptionExterneRequest;
import com.sonabel.cmt.dto.request.InscriptionRetraiteRequest;
import com.sonabel.cmt.dto.response.UtilisateurResponse;
import com.sonabel.cmt.entity.Role;
import com.sonabel.cmt.entity.TypeClientConfig;
import com.sonabel.cmt.entity.Utilisateur;
import com.sonabel.cmt.enums.*;
import com.sonabel.cmt.exception.BusinessException;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.mapper.EntityMapper;
import com.sonabel.cmt.repository.RoleRepository;
import com.sonabel.cmt.repository.TypeClientConfigRepository;
import com.sonabel.cmt.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class InscriptionService {

    private static final Logger log = LoggerFactory.getLogger(InscriptionService.class);

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final TypeClientConfigRepository typeClientConfigRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Transactional
    public UtilisateurResponse inscrireAgent(InscriptionAgentRequest request) {
        String username = genererUsername(request.getEmail());
        validerChampsCommuns(request.getEmail(), username, request.getMatricule());

        Role clientRole = roleRepository.findByNom(RoleType.CLIENT)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle CLIENT introuvable"));

        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .sexe(Sexe.valueOf(request.getSexe()))
                .dateNaissance(request.getDateNaissance())
                .email(request.getEmail())
                .username(username)
                .telephone(request.getTelephone())
                .matricule(request.getMatricule())
                .typeClient(TypeClient.AGENT_SONABEL)
                .statutCompte(StatutCompte.EN_ATTENTE)
                .tauxReduction(getTauxReduction(TypeClient.AGENT_SONABEL))
                .fichierJustificatif(normaliserFichier(request.getFichierJustificatif()))
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .actif(true)
                .roles(new java.util.HashSet<>(Set.of(clientRole)))
                .build();

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        notificationService.notifierAdmins(
                TypeNotification.NOUVELLE_DEMANDE_INSCRIPTION,
                "Nouvelle demande d'inscription",
                saved.getPrenom() + " " + saved.getNom() + " (Agent SONABEL) a soumis une demande d'inscription.",
                null, null);
        return EntityMapper.toUtilisateurResponse(saved);
    }

    @Transactional
    public UtilisateurResponse inscrireRetraite(InscriptionRetraiteRequest request) {
        String username = genererUsername(request.getEmail());
        validerChampsCommuns(request.getEmail(), username, request.getMatricule());

        Role clientRole = roleRepository.findByNom(RoleType.CLIENT)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle CLIENT introuvable"));

        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .sexe(Sexe.valueOf(request.getSexe()))
                .dateNaissance(request.getDateNaissance())
                .email(request.getEmail())
                .username(username)
                .telephone(request.getTelephone())
                .matricule(request.getMatricule())
                .dateDepartRetraite(request.getDateDepartRetraite())
                .typeClient(TypeClient.RETRAITE_SONABEL)
                .statutCompte(StatutCompte.EN_ATTENTE)
                .tauxReduction(getTauxReduction(TypeClient.RETRAITE_SONABEL))
                .fichierJustificatif(normaliserFichier(request.getFichierJustificatif()))
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .actif(true)
                .roles(new java.util.HashSet<>(Set.of(clientRole)))
                .build();

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        notificationService.notifierAdmins(
                TypeNotification.NOUVELLE_DEMANDE_INSCRIPTION,
                "Nouvelle demande d'inscription",
                saved.getPrenom() + " " + saved.getNom() + " (Retraité SONABEL) a soumis une demande d'inscription.",
                null, null);
        return EntityMapper.toUtilisateurResponse(saved);
    }

    @Transactional
    public UtilisateurResponse inscrireExterne(InscriptionExterneRequest request) {
        String username = genererUsername(request.getEmail());
        validerChampsCommuns(request.getEmail(), username, null);

        Role clientRole = roleRepository.findByNom(RoleType.CLIENT)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle CLIENT introuvable"));

        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .sexe(Sexe.valueOf(request.getSexe()))
                .dateNaissance(request.getDateNaissance())
                .email(request.getEmail())
                .username(username)
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .typePiece(TypePieceIdentite.valueOf(request.getTypePiece()))
                .numeroPiece(request.getNumeroPiece())
                .typeClient(TypeClient.CLIENT_EXTERNE)
                .statutCompte(StatutCompte.EN_ATTENTE)
                .tauxReduction(getTauxReduction(TypeClient.CLIENT_EXTERNE))
                .fichierJustificatif(normaliserFichier(request.getFichierJustificatif()))
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .actif(true)
                .roles(new java.util.HashSet<>(Set.of(clientRole)))
                .build();

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        notificationService.notifierAdmins(
                TypeNotification.NOUVELLE_DEMANDE_INSCRIPTION,
                "Nouvelle demande d'inscription",
                saved.getPrenom() + " " + saved.getNom() + " (Client Externe) a soumis une demande d'inscription.",
                null, null);
        return EntityMapper.toUtilisateurResponse(saved);
    }

    private void validerChampsCommuns(String email, String username, String matricule) {
        if (utilisateurRepository.existsByEmail(email)) {
            throw new BusinessException("Cet email est déjà utilisé");
        }
        if (utilisateurRepository.existsByUsername(username)) {
            throw new BusinessException("Ce nom d'utilisateur est déjà utilisé");
        }
        if (matricule != null && !matricule.isBlank() && utilisateurRepository.existsByMatricule(matricule)) {
            throw new BusinessException("Ce matricule est déjà associé à un compte existant");
        }
    }

    private String genererUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String username = base;
        int i = 1;
        while (utilisateurRepository.existsByUsername(username)) {
            username = base + i++;
        }
        return username;
    }

    private String normaliserFichier(String fichier) {
        return (fichier == null || fichier.isBlank()) ? null : fichier;
    }

    private BigDecimal getTauxReduction(TypeClient typeClient) {
        return typeClientConfigRepository.findByTypeClient(typeClient)
                .map(TypeClientConfig::getTauxReduction)
                .orElse(BigDecimal.ZERO);
    }
}
