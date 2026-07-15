package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.EmailData;
import com.sonabel.cmt.dto.request.PaiementRequest;
import com.sonabel.cmt.dto.response.PaiementResponse;
import com.sonabel.cmt.entity.Chambre;
import com.sonabel.cmt.entity.Paiement;
import com.sonabel.cmt.entity.Reservation;
import com.sonabel.cmt.entity.Utilisateur;
import com.sonabel.cmt.enums.StatutReservation;
import com.sonabel.cmt.enums.StatutChambre;
import com.sonabel.cmt.exception.BusinessException;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.mapper.EntityMapper;
import com.sonabel.cmt.repository.ChambreRepository;
import com.sonabel.cmt.repository.PaiementRepository;
import com.sonabel.cmt.repository.ReservationRepository;
import com.sonabel.cmt.repository.UtilisateurRepository;
import com.sonabel.cmt.enums.TypeNotification;
import com.sonabel.cmt.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final ReservationRepository reservationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ChambreRepository chambreRepository;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;

    public record PaiementConfirmeEvent(
            Long reservationId, Long utilisateurId,
            String chambreNumero, String centreNom,
            double montant, String modePaiement, String reference) {}

    public List<PaiementResponse> findAll() {
        return paiementRepository.findAll().stream()
                .map(EntityMapper::toPaiementResponse)
                .toList();
    }

    public List<PaiementResponse> findByCentre(Long centreId) {
        return paiementRepository.findByReservationChambreCentreIdOrderByDatePaiementDesc(centreId)
                .stream()
                .map(EntityMapper::toPaiementResponse)
                .toList();
    }

    public List<PaiementResponse> findByClientCourant() {
        Utilisateur client = SecurityUtils.getCurrentUser();
        return paiementRepository.findByReservationUtilisateurIdOrderByDatePaiementDesc(client.getId())
                .stream()
                .map(EntityMapper::toPaiementResponse)
                .toList();
    }

    public PaiementResponse findById(Long id) {
        return EntityMapper.toPaiementResponse(getById(id));
    }

    public PaiementResponse findByReservation(Long reservationId) {
        return paiementRepository.findByReservationId(reservationId)
                .map(EntityMapper::toPaiementResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable pour cette réservation"));
    }

    @Transactional
    public PaiementResponse enregistrer(PaiementRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Réservation introuvable"));

        if (reservation.getStatut() != StatutReservation.VALIDEE) {
            throw new BusinessException("Seules les réservations validées peuvent être payées");
        }
        if (paiementRepository.findByReservationId(reservation.getId()).isPresent()) {
            throw new BusinessException("Un paiement existe déjà pour cette réservation");
        }

        BigDecimal montantFinal = request.getMontant();
        if (request.getDateSortieReelle() != null) {
            long nuitsPlanifiees = ChronoUnit.DAYS.between(reservation.getDateArrivee(), reservation.getDateDepart());
            if (nuitsPlanifiees <= 0) nuitsPlanifiees = 1;
            BigDecimal prixParNuit = reservation.getMontantTotal() != null
                    ? reservation.getMontantTotal().divide(BigDecimal.valueOf(nuitsPlanifiees), RoundingMode.HALF_UP)
                    : reservation.getChambre().getPrixParNuit();
            long nuitsReelles = ChronoUnit.DAYS.between(reservation.getDateArrivee(), request.getDateSortieReelle());
            if (nuitsReelles <= 0) nuitsReelles = 1;
            montantFinal = prixParNuit.multiply(BigDecimal.valueOf(nuitsReelles));
            reservation.setDateSortieReelle(request.getDateSortieReelle());
        }

        Utilisateur courant = SecurityUtils.getCurrentUser();
        if (SecurityUtils.hasRole("CLIENT") && !reservation.getUtilisateur().getId().equals(courant.getId())) {
            throw new BusinessException("Vous ne pouvez payer que vos propres réservations");
        }

        Paiement paiement = Paiement.builder()
                .montant(montantFinal)
                .modePaiement(request.getModePaiement())
                .reference(request.getReference())
                .reservation(reservation)
                .enregistrePar(courant)
                .build();

        if (request.getDateSortieReelle() != null && !request.getDateSortieReelle().equals(reservation.getDateDepart())) {
            reservation.setDateDepart(request.getDateSortieReelle());
        }

        Paiement saved = paiementRepository.save(paiement);
        reservation.setPaiement(saved);

        Chambre ch = reservation.getChambre();
        ch.setStatut(StatutChambre.DISPONIBLE);
        chambreRepository.save(ch);
        reservationRepository.save(reservation);

        // Publier l'event — sera traité APRÈS le commit de cette transaction
        eventPublisher.publishEvent(new PaiementConfirmeEvent(
                reservation.getId(),
                reservation.getUtilisateur().getId(),
                reservation.getChambre().getNumero(),
                reservation.getChambre().getCentre() != null ? reservation.getChambre().getCentre().getNom() : "",
                montantFinal.doubleValue(),
                saved.getModePaiement() != null ? saved.getModePaiement().name() : "",
                saved.getReference()
        ));

        return EntityMapper.toPaiementResponse(saved);
    }

    // Déclenché APRÈS le commit — le paiement est garanti visible en BDD
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPaiementConfirme(PaiementConfirmeEvent event) {
        try {
            Reservation r = reservationRepository.findById(event.reservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Réservation introuvable"));
            Utilisateur u = utilisateurRepository.findById(event.utilisateurId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
            String sujet = "Confirmation de paiement - CMT SONABEL";
            String msg = "Votre paiement de " + String.format("%,.0f", event.montant())
                    + " FCFA pour la chambre " + event.chambreNumero() + " a été confirmé.";
            EmailData emailData = EmailData.ofPaiement(
                    event.chambreNumero(), event.centreNom(),
                    event.montant(), event.modePaiement(), event.reference());
            notificationService.creerNotification(u, TypeNotification.PAYEMENT_CONFIRME, sujet, msg, r, emailData);
        } catch (Exception e) {
            log.error("Erreur notification paiement réservation {} : {}", event.reservationId(), e.getMessage(), e);
        }
    }

    private Paiement getById(Long id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable"));
    }
}
