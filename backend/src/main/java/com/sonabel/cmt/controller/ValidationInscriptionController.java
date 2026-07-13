package com.sonabel.cmt.controller;

import com.sonabel.cmt.dto.request.ValidationInscriptionRequest;
import com.sonabel.cmt.dto.response.DemandeInscriptionResponse;
import com.sonabel.cmt.service.ValidationInscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inscriptions/demandes")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Validation inscriptions", description = "Gestion des demandes d'inscription")
public class ValidationInscriptionController {

    private final ValidationInscriptionService validationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lister les demandes d'inscription en attente")
    public ResponseEntity<List<DemandeInscriptionResponse>> listerDemandes() {
        return ResponseEntity.ok(validationService.listerDemandes());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Consulter le dossier d'une demande")
    public ResponseEntity<DemandeInscriptionResponse> consulterDossier(@PathVariable Long id) {
        return ResponseEntity.ok(validationService.consulterDossier(id));
    }

    @PostMapping("/{id}/approuver")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approuver une demande d'inscription")
    public ResponseEntity<DemandeInscriptionResponse> approuver(@PathVariable Long id) {
        return ResponseEntity.ok(validationService.approuver(id));
    }

    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Rejeter une demande d'inscription avec motif")
    public ResponseEntity<DemandeInscriptionResponse> rejeter(@PathVariable Long id, @Valid @RequestBody ValidationInscriptionRequest request) {
        return ResponseEntity.ok(validationService.rejeter(id, request.getMotif()));
    }
}
