package com.sonabel.cmt.service;

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
import com.sonabel.cmt.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final ReservationRepository reservationRepository;
    private final ChambreRepository chambreRepository;

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
        try {
            Reservation reservation = reservationRepository.findById(request.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Réservation introuvable"));

            if (reservation.getStatut() != StatutReservation.VALIDEE) {
                throw new BusinessException("Seules les réservations validées peuvent être payées");
            }
            if (paiementRepository.findByReservationId(reservation.getId()).isPresent()) {
                throw new BusinessException("Un paiement existe déjà pour cette réservation");
            }

            // Calcul du montant réel basé sur le nombre de nuits effectuées
            BigDecimal montantFinal = request.getMontant();
            if (request.getDateSortieReelle() != null) {
                long nuitsPlanifiees = ChronoUnit.DAYS.between(reservation.getDateArrivee(), reservation.getDateDepart());
                if (nuitsPlanifiees <= 0) nuitsPlanifiees = 1;
                BigDecimal prixParNuit;
                if (reservation.getMontantTotal() != null) {
                    prixParNuit = reservation.getMontantTotal()
                            .divide(BigDecimal.valueOf(nuitsPlanifiees), RoundingMode.HALF_UP);
                } else {
                    prixParNuit = reservation.getChambre().getPrixParNuit();
                }

                long nuitsReelles = ChronoUnit.DAYS.between(reservation.getDateArrivee(), request.getDateSortieReelle());
                if (nuitsReelles <= 0) nuitsReelles = 1;
                montantFinal = prixParNuit.multiply(BigDecimal.valueOf(nuitsReelles));
                reservation.setDateSortieReelle(request.getDateSortieReelle());
            }

            Utilisateur courant = SecurityUtils.getCurrentUser();
            boolean isClient = SecurityUtils.hasRole("CLIENT");
            if (isClient && !reservation.getUtilisateur().getId().equals(courant.getId())) {
                throw new BusinessException("Vous ne pouvez payer que vos propres réservations");
            }

            Paiement paiement = Paiement.builder()
                    .montant(montantFinal)
                    .modePaiement(request.getModePaiement())
                    .reference(request.getReference())
                    .reservation(reservation)
                    .enregistrePar(courant)
                    .build();

            // Mettre à jour la date de départ si la sortie réelle est différente
            if (request.getDateSortieReelle() != null && !request.getDateSortieReelle().equals(reservation.getDateDepart())) {
                reservation.setDateDepart(request.getDateSortieReelle());
            }

            Paiement saved = paiementRepository.save(paiement);
            reservation.setPaiement(saved);

            // Libérer la chambre si la date de sortie réelle est aujourd'hui ou déjà passée
            if (request.getDateSortieReelle() != null && !request.getDateSortieReelle().isAfter(LocalDate.now())) {
                Chambre ch = reservation.getChambre();
                ch.setStatut(StatutChambre.DISPONIBLE);
                chambreRepository.save(ch);
            }

            return EntityMapper.toPaiementResponse(saved);
        } catch (BusinessException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erreur lors de l'enregistrement du paiement: {}", e.getMessage(), e);
            throw new BusinessException("Erreur: " + e.getMessage());
        }
    }

    private Paiement getById(Long id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable"));
    }
}
