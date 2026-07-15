package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.request.ChambreRequest;
import com.sonabel.cmt.dto.response.ChambreResponse;
import com.sonabel.cmt.entity.Chambre;
import com.sonabel.cmt.entity.Reservation;
import com.sonabel.cmt.enums.StatutChambre;
import com.sonabel.cmt.exception.BusinessException;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.mapper.EntityMapper;
import com.sonabel.cmt.repository.ChambreRepository;
import com.sonabel.cmt.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChambreService {

    private final ChambreRepository chambreRepository;
    private final CentreService centreService;
    private final ReservationRepository reservationRepository;

    public List<ChambreResponse> findAll() {
        LocalDate aujourdhui = LocalDate.now();
        return chambreRepository.findAll().stream()
                .map(ch -> {
                    if (ch.getStatut() == StatutChambre.OCCUPEE) {
                        List<Reservation> actives = reservationRepository.findActiveByChambreId(ch.getId(), aujourdhui);
                        if (!actives.isEmpty()) {
                            Reservation r = actives.get(0);
                            return EntityMapper.toChambreResponse(ch, false,
                                    r.getUtilisateur().getPrenom() + " " + r.getUtilisateur().getNom(),
                                    r.getDateArrivee(), r.getDateDepart());
                        }
                    }
                    return EntityMapper.toChambreResponse(ch, ch.getStatut() == StatutChambre.DISPONIBLE, null, null, null);
                })
                .toList();
    }

    public List<ChambreResponse> findByCentre(Long centreId) {
        LocalDate aujourdhui = LocalDate.now();
        return chambreRepository.findByCentreId(centreId).stream()
                .map(ch -> {
                    if (ch.getStatut() == StatutChambre.OCCUPEE) {
                        List<Reservation> actives = reservationRepository.findActiveByChambreId(ch.getId(), aujourdhui);
                        if (!actives.isEmpty()) {
                            Reservation r = actives.get(0);
                            String nom = r.getUtilisateur().getPrenom() + " " + r.getUtilisateur().getNom();
                            return EntityMapper.toChambreResponse(ch, false, nom, r.getDateArrivee(), r.getDateDepart());
                        }
                    }
                    return EntityMapper.toChambreResponse(ch, ch.getStatut() == StatutChambre.DISPONIBLE, null, null, null);
                })
                .toList();
    }

    public List<ChambreResponse> findDisponibles(Long centreId, LocalDate arrivee, LocalDate depart) {
        return chambreRepository.findByCentreId(centreId).stream()
                // Exclure uniquement les chambres en maintenance
                .filter(ch -> ch.getStatut() != StatutChambre.MAINTENANCE)
                // Exclure les chambres avec une réservation EN_ATTENTE ou VALIDEE qui chevauche la période
                .filter(ch -> !reservationRepository.existsChevauchement(ch.getId(), arrivee, depart, null))
                .map(ch -> EntityMapper.toChambreResponse(ch, true, null, null, null))
                .toList();
    }

    public ChambreResponse findById(Long id) {
        Chambre chambre = getById(id);
        return EntityMapper.toChambreResponse(chambre, chambre.getStatut() == StatutChambre.DISPONIBLE, null, null, null);
    }

    @Transactional
    public ChambreResponse create(ChambreRequest request) {
        Chambre chambre = Chambre.builder()
                .numero(request.getNumero())
                .type(request.getType() != null ? request.getType() : "STANDARD")
                .capacite(request.getCapacite() != null ? request.getCapacite() : 1)
                .image(request.getImage())
                .prixParNuit(request.getPrixParNuit())
                .statut(request.getStatut())
                .centre(centreService.getById(request.getCentreId()))
                .build();
        return EntityMapper.toChambreResponse(chambreRepository.save(chambre), true, null, null, null);
    }

    @Transactional
    public ChambreResponse update(Long id, ChambreRequest request) {
        Chambre chambre = getById(id);
        chambre.setNumero(request.getNumero());
        chambre.setType(request.getType() != null ? request.getType() : "STANDARD");
        chambre.setCapacite(request.getCapacite() != null ? request.getCapacite() : 1);
        chambre.setPrixParNuit(request.getPrixParNuit());
        chambre.setStatut(request.getStatut());
        chambre.setCentre(centreService.getById(request.getCentreId()));
        return EntityMapper.toChambreResponse(chambreRepository.save(chambre),
                chambre.getStatut() == StatutChambre.DISPONIBLE, null, null, null);
    }

    @Transactional
    public void delete(Long id) {
        if (!chambreRepository.existsById(id)) {
            throw new ResourceNotFoundException("Chambre introuvable");
        }
        long reservationCount = reservationRepository.countByChambreId(id);
        if (reservationCount > 0) {
            throw new BusinessException("Impossible de supprimer cette chambre : " + reservationCount + " réservation(s) y sont liées.");
        }
        chambreRepository.deleteById(id);
    }

    @Transactional
    public ChambreResponse changerStatut(Long id, StatutChambre statut) {
        Chambre chambre = getById(id);
        chambre.setStatut(statut);
        return EntityMapper.toChambreResponse(chambreRepository.save(chambre),
                statut == StatutChambre.DISPONIBLE, null, null, null);
    }

    public Chambre getById(Long id) {
        return chambreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre introuvable"));
    }
}
