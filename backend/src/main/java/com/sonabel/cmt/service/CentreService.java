package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.request.CentreRequest;
import com.sonabel.cmt.dto.response.CentreResponse;
import com.sonabel.cmt.entity.Centre;
import com.sonabel.cmt.exception.BusinessException;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.mapper.EntityMapper;
import com.sonabel.cmt.repository.CentreRepository;
import com.sonabel.cmt.repository.ChambreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CentreService {

    private final CentreRepository centreRepository;
    private final com.sonabel.cmt.repository.UtilisateurRepository utilisateurRepository;
    private final ChambreRepository chambreRepository;

    private CentreResponse enrichCentreResponse(CentreResponse response) {
        if (response == null) return null;
        utilisateurRepository.findFirstByCentreIdAndRolesNom(response.getId(), com.sonabel.cmt.enums.RoleType.GERANT)
            .ifPresent(gerant -> {
                response.setGerantId(gerant.getId());
                response.setGerantNom(gerant.getPrenom() + " " + gerant.getNom());
            });
        return response;
    }

    private Long getAssignedCentreIdForGerant() {
        if (com.sonabel.cmt.security.SecurityUtils.hasRole("GERANT")) {
            try {
                com.sonabel.cmt.entity.Utilisateur user = com.sonabel.cmt.security.SecurityUtils.getCurrentUser();
                if (user != null && user.getCentre() != null) {
                    return user.getCentre().getId();
                }
            } catch (Exception e) {
                // Ignore
            }
        }
        return null;
    }

    public List<CentreResponse> findAll() {
        List<Centre> list = centreRepository.findAll();
        Long assignedId = getAssignedCentreIdForGerant();
        if (assignedId != null) {
            list = list.stream().filter(c -> c.getId().equals(assignedId)).toList();
        }
        return list.stream()
                .map(EntityMapper::toCentreResponse)
                .map(this::enrichCentreResponse)
                .toList();
    }

    public CentreResponse findById(Long id) {
        Long assignedId = getAssignedCentreIdForGerant();
        if (assignedId != null && !id.equals(assignedId)) {
            throw new com.sonabel.cmt.exception.BusinessException("Accès refusé à ce centre");
        }
        return enrichCentreResponse(EntityMapper.toCentreResponse(getById(id)));
    }

    public List<CentreResponse> search(String ville) {
        List<Centre> list = ville != null && !ville.isBlank()
                ? centreRepository.findByVilleContainingIgnoreCase(ville)
                : centreRepository.findAll();
        Long assignedId = getAssignedCentreIdForGerant();
        if (assignedId != null) {
            list = list.stream().filter(c -> c.getId().equals(assignedId)).toList();
        }
        return list.stream()
                .map(EntityMapper::toCentreResponse)
                .map(this::enrichCentreResponse)
                .toList();
    }

    public List<CentreResponse> findProches(BigDecimal latitude, BigDecimal longitude) {
        List<Centre> list = centreRepository.findAll();
        Long assignedId = getAssignedCentreIdForGerant();
        if (assignedId != null) {
            list = list.stream().filter(c -> c.getId().equals(assignedId)).toList();
        }
        return list.stream()
                .filter(c -> c.getLatitude() != null && c.getLongitude() != null)
                .map(c -> {
                    CentreResponse response = EntityMapper.toCentreResponse(c);
                    response.setDistanceKm(calculerDistance(
                            latitude.doubleValue(), longitude.doubleValue(),
                            c.getLatitude().doubleValue(), c.getLongitude().doubleValue()));
                    return enrichCentreResponse(response);
                })
                .sorted(Comparator.comparing(CentreResponse::getDistanceKm))
                .toList();
    }

    @Transactional
    public CentreResponse create(CentreRequest request) {
        Centre centre = mapToEntity(new Centre(), request);
        Centre savedCentre = centreRepository.save(centre);

        Long gerantId = request.getGerantId();
        if (gerantId != null) {
            com.sonabel.cmt.entity.Utilisateur newGerant = utilisateurRepository.findById(gerantId)
                .orElseThrow(() -> new ResourceNotFoundException("Gérant introuvable"));
            newGerant.setCentre(savedCentre);
            utilisateurRepository.save(newGerant);
        }
        return enrichCentreResponse(EntityMapper.toCentreResponse(savedCentre));
    }

    @Transactional
    public CentreResponse update(Long id, CentreRequest request) {
        Centre centre = getById(id);
        mapToEntity(centre, request);

        // Clear previous manager association
        utilisateurRepository.findFirstByCentreIdAndRolesNom(id, com.sonabel.cmt.enums.RoleType.GERANT)
            .ifPresent(prevGerant -> {
                prevGerant.setCentre(null);
                utilisateurRepository.save(prevGerant);
            });

        Centre savedCentre = centreRepository.save(centre);

        Long gerantId = request.getGerantId();
        if (gerantId != null) {
            com.sonabel.cmt.entity.Utilisateur newGerant = utilisateurRepository.findById(gerantId)
                .orElseThrow(() -> new ResourceNotFoundException("Gérant introuvable"));
            newGerant.setCentre(savedCentre);
            utilisateurRepository.save(newGerant);
        }
        return enrichCentreResponse(EntityMapper.toCentreResponse(savedCentre));
    }

    @Transactional
    public void delete(Long id) {
        if (!centreRepository.existsById(id)) {
            throw new ResourceNotFoundException("Centre introuvable");
        }
        long chambreCount = chambreRepository.countByCentreId(id);
        if (chambreCount > 0) {
            throw new BusinessException("Impossible de supprimer ce centre : " + chambreCount + " chambre(s) lui sont rattachées.");
        }
        utilisateurRepository.findFirstByCentreIdAndRolesNom(id, com.sonabel.cmt.enums.RoleType.GERANT)
            .ifPresent(prevGerant -> {
                prevGerant.setCentre(null);
                utilisateurRepository.save(prevGerant);
            });
        centreRepository.deleteById(id);
    }

    public Centre getById(Long id) {
        return centreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Centre introuvable"));
    }

    private Centre mapToEntity(Centre centre, CentreRequest request) {
        centre.setNom(request.getNom());
        centre.setVille(request.getVille());
        centre.setAdresse(request.getAdresse());
        centre.setTelephone(request.getTelephone());
        centre.setLatitude(request.getLatitude());
        centre.setLongitude(request.getLongitude());
        centre.setDescription(request.getDescription());
        centre.setImage(request.getImage());
        centre.setStatut(request.getStatut());
        return centre;
    }

    /** Formule de Haversine - distance en km */
    public double calculerDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100.0) / 100.0;
    }
}
