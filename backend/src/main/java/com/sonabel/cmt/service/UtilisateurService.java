package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.request.ResetPasswordRequest;
import com.sonabel.cmt.dto.request.UtilisateurRequest;
import com.sonabel.cmt.dto.response.UtilisateurResponse;
import com.sonabel.cmt.entity.Centre;
import com.sonabel.cmt.entity.Role;
import com.sonabel.cmt.entity.Utilisateur;
import com.sonabel.cmt.enums.RoleType;
import com.sonabel.cmt.enums.TypeClient;
import com.sonabel.cmt.exception.BusinessException;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.mapper.EntityMapper;
import com.sonabel.cmt.repository.CentreRepository;
import com.sonabel.cmt.repository.RoleRepository;
import com.sonabel.cmt.repository.UtilisateurRepository;
import com.sonabel.cmt.util.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private static final Pattern MATRICULE_PATTERN = Pattern.compile("^\\d{1,5}[A-Za-z]$");

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final CentreRepository centreRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UtilisateurResponse> findAll(String search) {
        List<Utilisateur> users = (search != null && !search.isBlank())
                ? utilisateurRepository.searchActifs(search.trim())
                : utilisateurRepository.findAllActifs();
        if (com.sonabel.cmt.security.SecurityUtils.hasRole("GERANT")) {
            return users.stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getNom() == RoleType.CLIENT))
                    .map(EntityMapper::toUtilisateurResponse)
                    .toList();
        }
        return users.stream().map(EntityMapper::toUtilisateurResponse).toList();
    }

    public UtilisateurResponse findById(Long id) {
        return EntityMapper.toUtilisateurResponse(getById(id));
    }

    @Transactional
    public UtilisateurResponse create(UtilisateurRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            request.setUsername(genererUsername(request.getEmail()));
        }
        validateRequest(request, null);
        String rawPassword = resolvePassword(request, true);
        Utilisateur utilisateur = mapToEntity(new Utilisateur(), request, true);
        utilisateur.setMotDePasse(passwordEncoder.encode(rawPassword));
        utilisateur.setRoles(resolveRoles(Set.of(request.getTypeUtilisateur())));
        Utilisateur saved = utilisateurRepository.save(utilisateur);
        UtilisateurResponse response = EntityMapper.toUtilisateurResponse(saved);
        response.setMotDePasseTemporaire(rawPassword);
        return response;
    }

    @Transactional
    public UtilisateurResponse update(Long id, UtilisateurRequest request) {
        Utilisateur utilisateur = getById(id);
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            request.setUsername(utilisateur.getUsername());
        }
        validateRequest(request, id);
        mapToEntity(utilisateur, request, false);
        if (request.getMotDePasse() != null && !request.getMotDePasse().isBlank()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        }
        utilisateur.setRoles(resolveRoles(Set.of(request.getTypeUtilisateur())));
        return EntityMapper.toUtilisateurResponse(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public void delete(Long id) {
        Utilisateur utilisateur = getById(id);
        utilisateur.setDeletedAt(LocalDateTime.now());
        utilisateur.setActif(false);
        utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public UtilisateurResponse activate(Long id) {
        Utilisateur utilisateur = getById(id);
        utilisateur.setActif(true);
        return EntityMapper.toUtilisateurResponse(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public UtilisateurResponse deactivate(Long id) {
        Utilisateur utilisateur = getById(id);
        utilisateur.setActif(false);
        return EntityMapper.toUtilisateurResponse(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public UtilisateurResponse resetPassword(Long id, ResetPasswordRequest request) {
        Utilisateur utilisateur = getById(id);
        String raw = (request != null && request.getNouveauMotDePasse() != null && !request.getNouveauMotDePasse().isBlank())
                ? request.getNouveauMotDePasse()
                : PasswordGenerator.generate(12);
        if (raw.length() < 8) {
            throw new BusinessException("Le mot de passe doit contenir au moins 8 caractères");
        }
        utilisateur.setMotDePasse(passwordEncoder.encode(raw));
        UtilisateurResponse response = EntityMapper.toUtilisateurResponse(utilisateurRepository.save(utilisateur));
        response.setMotDePasseTemporaire(raw);
        return response;
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

    private Utilisateur getById(Long id) {
        return utilisateurRepository.findActifById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    private void validateRequest(UtilisateurRequest request, Long excludeId) {
        if (request.getTypeUtilisateur() == null) {
            throw new BusinessException("Le type utilisateur est obligatoire");
        }
        if (excludeId == null) {
            if (utilisateurRepository.existsByEmail(request.getEmail())) {
                throw new BusinessException("Cet email est déjà utilisé");
            }
            if (utilisateurRepository.existsByUsername(request.getUsername())) {
                throw new BusinessException("Ce nom d'utilisateur est déjà utilisé");
            }
        } else {
            Utilisateur existing = getById(excludeId);
            if (!existing.getEmail().equalsIgnoreCase(request.getEmail()) && utilisateurRepository.existsByEmail(request.getEmail())) {
                throw new BusinessException("Cet email est déjà utilisé");
            }
            if (!existing.getUsername().equalsIgnoreCase(request.getUsername()) && utilisateurRepository.existsByUsername(request.getUsername())) {
                throw new BusinessException("Ce nom d'utilisateur est déjà utilisé");
            }
        }
        if (request.getMatricule() != null && !request.getMatricule().isBlank()) {
            if (!MATRICULE_PATTERN.matcher(request.getMatricule()).matches()) {
                throw new BusinessException("Matricule invalide : 5 chiffres max + 1 lettre (ex: 12345A)");
            }
            if (excludeId == null) {
                if (utilisateurRepository.existsByMatricule(request.getMatricule())) {
                    throw new BusinessException("Ce matricule est déjà utilisé");
                }
            } else {
                Utilisateur existing = getById(excludeId);
                if (!request.getMatricule().equals(existing.getMatricule()) && utilisateurRepository.existsByMatricule(request.getMatricule())) {
                    throw new BusinessException("Ce matricule est déjà utilisé");
                }
            }
        }
        if (request.getMotDePasse() != null && !request.getMotDePasse().isBlank()
                && request.getConfirmationMotDePasse() != null
                && !request.getMotDePasse().equals(request.getConfirmationMotDePasse())) {
            throw new BusinessException("La confirmation du mot de passe ne correspond pas");
        }
        RoleType type = request.getTypeUtilisateur();
        if (type == RoleType.GERANT && request.getCentreId() == null) {
            throw new BusinessException("Le centre géré est obligatoire pour un gérant");
        }
        if (type == RoleType.CLIENT) {
            if (request.getTypeClient() == null) {
                throw new BusinessException("Le type client est obligatoire");
            }
            if (request.getTypeClient() == TypeClient.AGENT_SONABEL) {
                if (request.getMatricule() == null || request.getMatricule().isBlank()) {
                    throw new BusinessException("Le matricule SONABEL est obligatoire pour un agent");
                }
            } else if (request.getTypeClient() == TypeClient.CLIENT_EXTERNE) {
                if (request.getTypePiece() == null || request.getNumeroPiece() == null || request.getNumeroPiece().isBlank()) {
                    throw new BusinessException("Type et numéro de pièce obligatoires pour un client externe");
                }
            }
        }
    }

    private String resolvePassword(UtilisateurRequest request, boolean isCreate) {
        if (request.isGenererMotDePasse() || (isCreate && (request.getMotDePasse() == null || request.getMotDePasse().isBlank()))) {
            return PasswordGenerator.generate(12);
        }
        if (request.getMotDePasse() == null || request.getMotDePasse().length() < 8) {
            throw new BusinessException("Le mot de passe doit contenir au moins 8 caractères");
        }
        return request.getMotDePasse();
    }

    private Utilisateur mapToEntity(Utilisateur u, UtilisateurRequest request, boolean isCreate) {
        u.setNom(request.getNom());
        u.setPrenom(request.getPrenom());
        u.setSexe(request.getSexe());
        u.setEmail(request.getEmail());
        u.setUsername(request.getUsername());
        u.setTelephone(request.getTelephone());
        u.setAdresse(request.getAdresse());
        u.setPhotoUrl(request.getPhotoUrl());
        u.setActif(request.getActif() != null ? request.getActif() : true);
        RoleType type = request.getTypeUtilisateur();
        u.setCentre(type == RoleType.GERANT ? resolveCentre(request.getCentreId()) : null);
        u.setFonction(null);
        u.setNiveauAcces(null);
        u.setMatricule(null);
        u.setTypeClient(null);
        u.setDirection(null);
        u.setService(null);
        u.setTypePiece(null);
        u.setNumeroPiece(null);
        u.setNationalite(null);
        u.setProfession(null);
        switch (type) {
            case ADMIN -> {
                u.setMatricule(blankToNull(request.getMatricule()));
                u.setFonction(blankToNull(request.getFonction()));
                u.setNiveauAcces(request.getNiveauAcces());
            }
            case GERANT -> {
                u.setMatricule(blankToNull(request.getMatricule()));
                u.setFonction(blankToNull(request.getFonction()));
            }
            case CLIENT -> {
                u.setTypeClient(request.getTypeClient());
                if (request.getTypeClient() == TypeClient.AGENT_SONABEL) {
                    u.setMatricule(request.getMatricule());
                    u.setDirection(blankToNull(request.getDirection()));
                    u.setService(blankToNull(request.getService()));
                    u.setFonction(blankToNull(request.getFonction()));
                    if (isCreate) {
                        u.setActif(false);
                    }
                } else {
                    u.setTypePiece(request.getTypePiece());
                    u.setNumeroPiece(request.getNumeroPiece());
                    u.setNationalite(blankToNull(request.getNationalite()));
                    u.setProfession(blankToNull(request.getProfession()));
                }
            }
        }
        return u;
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private Centre resolveCentre(Long centreId) {
        if (centreId == null) return null;
        return centreRepository.findById(centreId)
                .orElseThrow(() -> new ResourceNotFoundException("Centre introuvable"));
    }

    private Set<Role> resolveRoles(Set<RoleType> roleTypes) {
        return roleRepository.findByNomIn(roleTypes);
    }
}
