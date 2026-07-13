package com.sonabel.cmt.controller;

import com.sonabel.cmt.dto.request.ChambreRequest;
import com.sonabel.cmt.dto.response.ChambreResponse;
import com.sonabel.cmt.service.ChambreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/chambres")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Chambres", description = "Gestion des chambres")
public class ChambreController {

    private final ChambreService chambreService;

    @GetMapping
    public ResponseEntity<List<ChambreResponse>> findAll() {
        return ResponseEntity.ok(chambreService.findAll());
    }

    @GetMapping("/centre/{centreId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'CLIENT')")
    public ResponseEntity<List<ChambreResponse>> findByCentre(@PathVariable Long centreId) {
        return ResponseEntity.ok(chambreService.findByCentre(centreId));
    }

    @GetMapping("/disponibles/{centreId}")
    @Operation(summary = "Chambres disponibles pour une période")
    public ResponseEntity<List<ChambreResponse>> findDisponibles(
            @PathVariable Long centreId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate arrivee,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate depart) {
        return ResponseEntity.ok(chambreService.findDisponibles(centreId, arrivee, depart));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'CLIENT')")
    public ResponseEntity<ChambreResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(chambreService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ResponseEntity<ChambreResponse> create(@Valid @RequestBody ChambreRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chambreService.create(request));
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ResponseEntity<ChambreResponse> changerStatut(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(chambreService.changerStatut(id, com.sonabel.cmt.enums.StatutChambre.valueOf(body.get("statut"))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ResponseEntity<ChambreResponse> update(@PathVariable Long id, @Valid @RequestBody ChambreRequest request) {
        return ResponseEntity.ok(chambreService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        chambreService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
