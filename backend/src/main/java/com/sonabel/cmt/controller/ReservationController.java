package com.sonabel.cmt.controller;

import com.sonabel.cmt.dto.request.RefuserReservationRequest;
import com.sonabel.cmt.dto.request.ReservationRequest;
import com.sonabel.cmt.dto.response.ReservationResponse;
import com.sonabel.cmt.security.SecurityUtils;
import com.sonabel.cmt.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Réservations", description = "Gestion des réservations")
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReservationResponse>> findAll() {
        return ResponseEntity.ok(reservationService.findAll());
    }

    @GetMapping("/mes-reservations")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Historique des réservations du client connecté")
    public ResponseEntity<List<ReservationResponse>> mesReservations() {
        return ResponseEntity.ok(reservationService.findByUtilisateur(SecurityUtils.getCurrentUser().getId()));
    }

    @GetMapping("/centre/{centreId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ResponseEntity<List<ReservationResponse>> findByCentre(@PathVariable Long centreId) {
        return ResponseEntity.ok(reservationService.findByCentre(centreId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReservationResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Créer une réservation")
    public ResponseEntity<ReservationResponse> create(@Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.create(request));
    }

    @PatchMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ResponseEntity<ReservationResponse> valider(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.valider(id));
    }

    @PatchMapping("/{id}/refuser")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ResponseEntity<ReservationResponse> refuser(@PathVariable Long id, @Valid @RequestBody RefuserReservationRequest request) {
        return ResponseEntity.ok(reservationService.refuser(id, request.getMotifRejet()));
    }

    @PatchMapping("/{id}/annuler")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReservationResponse> annuler(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.annuler(id));
    }

}
