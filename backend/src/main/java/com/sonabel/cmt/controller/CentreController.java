package com.sonabel.cmt.controller;

import com.sonabel.cmt.dto.request.CentreRequest;
import com.sonabel.cmt.dto.response.CentreResponse;
import com.sonabel.cmt.service.CentreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/centres")
@RequiredArgsConstructor
@Tag(name = "Centres", description = "Gestion des centres d'hébergement")
public class CentreController {

    private final CentreService centreService;

    @GetMapping
    @Operation(summary = "Lister les centres")
    public ResponseEntity<List<CentreResponse>> findAll(@RequestParam(required = false) String ville) {
        return ResponseEntity.ok(centreService.search(ville));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CentreResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(centreService.findById(id));
    }

    @GetMapping("/proches")
    @Operation(summary = "Trouver les centres les plus proches (GPS)")
    public ResponseEntity<List<CentreResponse>> findProches(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude) {
        return ResponseEntity.ok(centreService.findProches(latitude, longitude));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<CentreResponse> create(@Valid @RequestBody CentreRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(centreService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<CentreResponse> update(@PathVariable Long id, @Valid @RequestBody CentreRequest request) {
        return ResponseEntity.ok(centreService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        centreService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
