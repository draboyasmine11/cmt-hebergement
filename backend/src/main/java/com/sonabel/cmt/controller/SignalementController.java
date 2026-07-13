package com.sonabel.cmt.controller;

import com.sonabel.cmt.dto.request.SignalementRequest;
import com.sonabel.cmt.dto.response.SignalementResponse;
import com.sonabel.cmt.service.SignalementService;
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
@RequestMapping("/signalements")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Signalements", description = "Signalement de problèmes par les utilisateurs")
public class SignalementController {

    private final SignalementService signalementService;

    @PostMapping
    public ResponseEntity<SignalementResponse> creer(@Valid @RequestBody SignalementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(signalementService.creer(request));
    }

    @GetMapping("/mes-signalements")
    public ResponseEntity<List<SignalementResponse>> mesSignalements() {
        return ResponseEntity.ok(signalementService.findMine());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SignalementResponse>> findAll() {
        return ResponseEntity.ok(signalementService.findAll());
    }

    @PatchMapping("/{id}/traiter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SignalementResponse> traiter(@PathVariable Long id) {
        return ResponseEntity.ok(signalementService.traiter(id));
    }
}
