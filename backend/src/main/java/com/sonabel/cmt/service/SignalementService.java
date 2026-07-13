package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.request.SignalementRequest;
import com.sonabel.cmt.dto.response.SignalementResponse;
import com.sonabel.cmt.entity.Signalement;
import com.sonabel.cmt.entity.Utilisateur;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.repository.SignalementRepository;
import com.sonabel.cmt.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SignalementService {

    private final SignalementRepository signalementRepository;
    private final EmailService emailService;

    @Transactional
    public SignalementResponse creer(SignalementRequest request) {
        Utilisateur courant = SecurityUtils.getCurrentUser();

        Signalement signalement = Signalement.builder()
                .sujet(request.getSujet())
                .description(request.getDescription())
                .statut("EN_ATTENTE")
                .utilisateur(courant)
                .emailContact(courant.getEmail())
                .telephoneContact(courant.getTelephone())
                .build();

        Signalement saved = signalementRepository.save(signalement);

        emailService.envoyerSupport(
                request.getSujet(),
                emailService.signalementRecuHtml(request.getSujet(), request.getDescription(), courant.getEmail())
        );

        return toResponse(saved);
    }

    public List<SignalementResponse> findAll() {
        return signalementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<SignalementResponse> findMine() {
        Utilisateur courant = SecurityUtils.getCurrentUser();
        return signalementRepository.findByUtilisateurIdOrderByCreatedAtDesc(courant.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SignalementResponse traiter(Long id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement introuvable"));
        signalement.setStatut("TRAITE");
        signalement.setTraiteAt(LocalDateTime.now());
        return toResponse(signalementRepository.save(signalement));
    }

    private SignalementResponse toResponse(Signalement s) {
        return SignalementResponse.builder()
                .id(s.getId())
                .sujet(s.getSujet())
                .description(s.getDescription())
                .statut(s.getStatut())
                .emailContact(s.getEmailContact())
                .telephoneContact(s.getTelephoneContact())
                .utilisateurId(s.getUtilisateur() != null ? s.getUtilisateur().getId() : null)
                .utilisateurNom(s.getUtilisateur() != null ? s.getUtilisateur().getPrenom() + " " + s.getUtilisateur().getNom() : null)
                .createdAt(s.getCreatedAt())
                .traiteAt(s.getTraiteAt())
                .build();
    }
}
