package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.EmailData;
import com.sonabel.cmt.dto.request.ReservationRequest;
import com.sonabel.cmt.dto.response.ReservationResponse;
import com.sonabel.cmt.entity.Chambre;
import com.sonabel.cmt.entity.Reservation;
import com.sonabel.cmt.entity.Utilisateur;
import com.sonabel.cmt.enums.StatutChambre;
import com.sonabel.cmt.enums.StatutReservation;
import com.sonabel.cmt.enums.TypeClient;
import com.sonabel.cmt.enums.TypeNotification;
import com.sonabel.cmt.exception.BusinessException;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.mapper.EntityMapper;
import com.sonabel.cmt.repository.ReservationRepository;
import com.sonabel.cmt.repository.TarifRepository;
import com.sonabel.cmt.repository.UtilisateurRepository;
import com.sonabel.cmt.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ChambreService chambreService;
    private final NotificationService notificationService;
    private final TarifRepository tarifRepository;
    private final UtilisateurRepository utilisateurRepository;

    public List<ReservationResponse> findAll() {
        return reservationRepository.findAll().stream()
                .map(EntityMapper::toReservationResponse)
                .toList();
    }

    public List<ReservationResponse> findByUtilisateur(Long utilisateurId) {
        return reservationRepository.findByUtilisateurIdOrderByDateReservationDesc(utilisateurId)
                .stream()
                .map(EntityMapper::toReservationResponse)
                .toList();
    }

    public List<ReservationResponse> findByCentre(Long centreId) {
        return reservationRepository.findByChambreCentreIdOrderByDateReservationDesc(centreId)
                .stream()
                .map(EntityMapper::toReservationResponse)
                .toList();
    }

    public ReservationResponse findById(Long id) {
        return EntityMapper.toReservationResponse(getById(id));
    }

    @Transactional
    public ReservationResponse create(ReservationRequest request) {
        validerDates(request.getDateArrivee(), request.getDateDepart());

        Chambre chambre = chambreService.getById(request.getChambreId());
        if (chambre.getStatut() == StatutChambre.MAINTENANCE) {
            throw new BusinessException("Cette chambre est en maintenance");
        }
        if (reservationRepository.existsChevauchement(
                chambre.getId(), request.getDateArrivee(), request.getDateDepart(), null)) {
            throw new BusinessException("Cette chambre n'est pas disponible pour la période sélectionnée");
        }

        Utilisateur client = SecurityUtils.getCurrentUser();

        // Vérifier que le compte est actif
        if (client.getStatutCompte() == null || client.getStatutCompte() != com.sonabel.cmt.enums.StatutCompte.ACTIF) {
            throw new BusinessException("Votre compte n'est pas encore activé. Attendez la validation du gérant avant de faire une réservation.");
        }
        long nuits = ChronoUnit.DAYS.between(request.getDateArrivee(), request.getDateDepart());

        TypeClient typeClient = client.getTypeClient() != null ? client.getTypeClient() : TypeClient.CLIENT_EXTERNE;
        Long centreId = chambre.getCentre().getId();
        BigDecimal prixParNuit = tarifRepository.findByCentreIdAndTypeClient(centreId, typeClient)
                .map(t -> t.getPrixParNuit())
                .orElseThrow(() -> new BusinessException("Aucun tarif défini pour ce centre et ce type de client"));
        BigDecimal montant = prixParNuit.multiply(BigDecimal.valueOf(nuits));

        Reservation reservation = Reservation.builder()
                .dateArrivee(request.getDateArrivee())
                .dateDepart(request.getDateDepart())
                .statut(StatutReservation.EN_ATTENTE)
                .montantTotal(montant)
                .utilisateur(client)
                .chambre(chambre)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        String fmt = "dd/MM/yyyy";
        EmailData emailData = EmailData.of(
                chambre.getNumero(),
                chambre.getCentre().getNom(),
                request.getDateArrivee().format(DateTimeFormatter.ofPattern(fmt)),
                request.getDateDepart().format(DateTimeFormatter.ofPattern(fmt)),
                montant.doubleValue()
        );

        notificationService.creerNotification(client, TypeNotification.NOUVELLE_RESERVATION,
                "Réservation en attente",
                "Votre réservation pour la chambre " + chambre.getNumero() + " est en attente de validation.",
                saved, emailData);

        notificationService.notifierGerantsCentre(chambre.getCentre().getId(),
                TypeNotification.NOUVELLE_RESERVATION,
                "Nouvelle réservation",
                client.getPrenom() + " " + client.getNom() + " a demandé la chambre " + chambre.getNumero(),
                saved, emailData);

        notificationService.notifierAdmins(
                TypeNotification.NOUVELLE_RESERVATION,
                "Nouvelle réservation",
                client.getPrenom() + " " + client.getNom() + " a réservé la chambre " + chambre.getNumero() + " au centre " + chambre.getCentre().getNom(),
                saved, emailData);

        return EntityMapper.toReservationResponse(saved);
    }

    @Transactional
    public ReservationResponse valider(Long id) {
        Reservation reservation = getById(id);
        verifierGerant(reservation);
        if (reservation.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new BusinessException("Seules les réservations en attente peuvent être validées");
        }
        verifierDisponibilite(reservation);

        reservation.setStatut(StatutReservation.VALIDEE);
        reservation.getChambre().setStatut(StatutChambre.OCCUPEE);
        Reservation saved = reservationRepository.save(reservation);

        String fmt = "dd/MM/yyyy";
        EmailData emailData = EmailData.of(
                reservation.getChambre().getNumero(),
                reservation.getChambre().getCentre().getNom(),
                reservation.getDateArrivee().format(DateTimeFormatter.ofPattern(fmt)),
                reservation.getDateDepart().format(DateTimeFormatter.ofPattern(fmt)),
                reservation.getMontantTotal() != null ? reservation.getMontantTotal().doubleValue() : 0
        );

        notificationService.creerNotification(reservation.getUtilisateur(),
                TypeNotification.RESERVATION_VALIDEE,
                "Réservation validée",
                "Votre réservation pour la chambre " + reservation.getChambre().getNumero() + " a été validée.",
                saved, emailData);

        return EntityMapper.toReservationResponse(saved);
    }

    @Transactional
    public ReservationResponse refuser(Long id, String motifRejet) {
        Reservation reservation = getById(id);
        verifierGerant(reservation);
        if (reservation.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new BusinessException("Seules les réservations en attente peuvent être refusées");
        }
        reservation.setStatut(StatutReservation.REFUSEE);
        reservation.setMotifRejet(motifRejet);
        Reservation saved = reservationRepository.save(reservation);

        String fmt = "dd/MM/yyyy";
        EmailData emailData = EmailData.ofRefus(
                reservation.getChambre().getNumero(),
                reservation.getChambre().getCentre().getNom(),
                reservation.getDateArrivee().format(DateTimeFormatter.ofPattern(fmt)),
                reservation.getDateDepart().format(DateTimeFormatter.ofPattern(fmt)),
                reservation.getMontantTotal() != null ? reservation.getMontantTotal().doubleValue() : 0,
                motifRejet
        );

        notificationService.creerNotification(reservation.getUtilisateur(),
                TypeNotification.RESERVATION_REFUSEE,
                "Réservation refusée",
                "Votre réservation pour la chambre " + reservation.getChambre().getNumero() + " a été refusée. Motif : " + motifRejet,
                saved, emailData);

        return EntityMapper.toReservationResponse(saved);
    }

    @Transactional
    public ReservationResponse annuler(Long id) {
        Reservation reservation = getById(id);
        Utilisateur current = SecurityUtils.getCurrentUser();
        boolean isOwner = reservation.getUtilisateur().getId().equals(current.getId());
        boolean isGerantOrAdmin = SecurityUtils.hasRole("GERANT") || SecurityUtils.hasRole("ADMIN");

        if (!isOwner && !isGerantOrAdmin) {
            throw new BusinessException("Vous n'êtes pas autorisé à annuler cette réservation");
        }
        if (reservation.getStatut() == StatutReservation.ANNULEE || reservation.getStatut() == StatutReservation.REFUSEE) {
            throw new BusinessException("Cette réservation ne peut plus être annulée");
        }

        if (isOwner && !isGerantOrAdmin) {
            if (reservation.getDateArrivee().isBefore(LocalDate.now())) {
                throw new BusinessException("Vous ne pouvez plus annuler cette réservation car le séjour a déjà commencé. Veuillez contacter le gérant du centre.");
            }
        }

        reservation.setStatut(StatutReservation.ANNULEE);
        if (reservation.getChambre().getStatut() == StatutChambre.OCCUPEE) {
            reservation.getChambre().setStatut(StatutChambre.DISPONIBLE);
        }
        Reservation saved = reservationRepository.save(reservation);

        String clientNom = current.getPrenom() + " " + current.getNom();
        String chambreNumero = reservation.getChambre().getNumero();
        String centreNom = reservation.getChambre().getCentre().getNom();

        EmailData emailData = EmailData.of(chambreNumero, centreNom, "", "", 0);

        notificationService.creerNotification(reservation.getUtilisateur(),
                TypeNotification.RESERVATION_ANNULEE,
                "Réservation annulée",
                "Votre réservation pour la chambre " + chambreNumero + " au centre " + centreNom + " a été annulée.",
                saved, emailData);

        if (isOwner && !isGerantOrAdmin) {
            notificationService.notifierGerantsCentre(reservation.getChambre().getCentre().getId(),
                    TypeNotification.RESERVATION_ANNULEE,
                    "Annulation par un client",
                    "Le client " + clientNom + " a annulé sa réservation (chambre " + chambreNumero + ") au centre " + centreNom + ".",
                    saved, emailData);
        }

        return EntityMapper.toReservationResponse(saved);
    }

    private void verifierGerant(Reservation reservation) {
        if (SecurityUtils.hasRole("GERANT")) {
            Utilisateur currentUser = utilisateurRepository.findById(SecurityUtils.getCurrentUser().getId())
                    .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));
            Long centreGerant = currentUser.getCentre() != null ? currentUser.getCentre().getId() : null;
            if (centreGerant == null) return;
            Long centreReservation = reservation.getChambre().getCentre().getId();
            if (!centreGerant.equals(centreReservation)) {
                throw new BusinessException("Vous n'êtes pas autorisé à gérer cette réservation");
            }
        }
    }

    private void verifierDisponibilite(Reservation reservation) {
        if (reservationRepository.existsChevauchement(
                reservation.getChambre().getId(),
                reservation.getDateArrivee(),
                reservation.getDateDepart(),
                reservation.getId())) {
            throw new BusinessException("La chambre n'est plus disponible pour cette période");
        }
    }

    private void validerDates(LocalDate arrivee, LocalDate depart) {
        if (arrivee.isBefore(LocalDate.now())) {
            throw new BusinessException("La date d'arrivée ne peut pas être dans le passé");
        }
        if (!depart.isAfter(arrivee)) {
            throw new BusinessException("La date de départ doit être postérieure à la date d'arrivée");
        }
    }

    private Reservation getById(Long id) {
        return reservationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation introuvable"));
    }

}
