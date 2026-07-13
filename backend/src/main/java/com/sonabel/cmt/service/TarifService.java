package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.request.TarifRequest;
import com.sonabel.cmt.dto.response.TarifResponse;
import com.sonabel.cmt.entity.Centre;
import com.sonabel.cmt.entity.Tarif;
import com.sonabel.cmt.enums.TypeClient;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.repository.TarifRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TarifService {

    private final TarifRepository tarifRepository;
    private final CentreService centreService;

    public List<TarifResponse> findByCentre(Long centreId) {
        return tarifRepository.findByCentreId(centreId).stream()
                .map(this::toResponse)
                .toList();
    }

    public TarifResponse findByCentreAndTypeClient(Long centreId, TypeClient typeClient) {
        Tarif tarif = tarifRepository.findByCentreIdAndTypeClient(centreId, typeClient)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun tarif défini pour ce centre et ce type de client"));
        return toResponse(tarif);
    }

    @Transactional
    public TarifResponse save(TarifRequest request) {
        Centre centre = centreService.getById(request.getCentreId());
        Tarif tarif = tarifRepository.findByCentreIdAndTypeClient(request.getCentreId(), request.getTypeClient())
                .orElse(Tarif.builder()
                        .centre(centre)
                        .typeClient(request.getTypeClient())
                        .build());
        tarif.setPrixParNuit(request.getPrixParNuit());
        return toResponse(tarifRepository.save(tarif));
    }

    private TarifResponse toResponse(Tarif t) {
        Centre c = t.getCentre();
        return TarifResponse.builder()
                .id(t.getId())
                .centreId(c.getId())
                .centreNom(c.getNom())
                .centreVille(c.getVille())
                .typeClient(t.getTypeClient())
                .prixParNuit(t.getPrixParNuit())
                .build();
    }
}
