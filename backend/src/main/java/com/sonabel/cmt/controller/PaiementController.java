package com.sonabel.cmt.controller;

import com.sonabel.cmt.dto.request.PaiementRequest;
import com.sonabel.cmt.dto.response.PaiementResponse;
import com.sonabel.cmt.service.FactureService;
import com.sonabel.cmt.service.PaiementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/paiements")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Paiements", description = "Gestion des paiements et factures")
public class PaiementController {

    private final PaiementService paiementService;
    private final FactureService factureService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaiementResponse>> findAll() {
        return ResponseEntity.ok(paiementService.findAll());
    }

    @GetMapping("/centre/{centreId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Consulter les encaissements d'un centre")
    public ResponseEntity<List<PaiementResponse>> findByCentre(@PathVariable Long centreId) {
        return ResponseEntity.ok(paiementService.findByCentre(centreId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ResponseEntity<PaiementResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(paiementService.findById(id));
    }

    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaiementResponse> findByReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(paiementService.findByReservation(reservationId));
    }

    @GetMapping("/mes-paiements")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Consulter mes paiements (client)")
    public ResponseEntity<List<PaiementResponse>> mesPaiements() {
        return ResponseEntity.ok(paiementService.findByClientCourant());
    }

    @PostMapping
    @PreAuthorize("hasRole('GERANT')")
    @Operation(summary = "Enregistrer un paiement")
    public ResponseEntity<PaiementResponse> enregistrer(@Valid @RequestBody PaiementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paiementService.enregistrer(request));
    }

    @GetMapping("/facture/{reservationId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Générer un reçu PDF")
    public ResponseEntity<byte[]> genererFacture(@PathVariable Long reservationId) {
        byte[] pdf = factureService.genererFacture(reservationId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=recu-" + reservationId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/excel/{centreId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Exporter les reçus d'un centre en Excel")
    public ResponseEntity<byte[]> exporterExcel(@PathVariable Long centreId) {
        byte[] excel = factureService.exporterExcel(centreId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=recus-centre-" + centreId + ".xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }
}
