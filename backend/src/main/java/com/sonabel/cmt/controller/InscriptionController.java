package com.sonabel.cmt.controller;

import com.sonabel.cmt.dto.request.InscriptionAgentRequest;
import com.sonabel.cmt.dto.request.InscriptionExterneRequest;
import com.sonabel.cmt.dto.request.InscriptionRetraiteRequest;
import com.sonabel.cmt.dto.response.UtilisateurResponse;
import com.sonabel.cmt.service.InscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inscription")
@RequiredArgsConstructor
@Tag(name = "Inscription", description = "Inscription des clients par profil")
public class InscriptionController {

    private final InscriptionService inscriptionService;

    @PostMapping("/agent")
    @Operation(summary = "Inscription d'un agent SONABEL")
    public ResponseEntity<UtilisateurResponse> inscrireAgent(@Valid @RequestBody InscriptionAgentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inscriptionService.inscrireAgent(request));
    }

    @PostMapping("/retraite")
    @Operation(summary = "Inscription d'un retraité SONABEL")
    public ResponseEntity<UtilisateurResponse> inscrireRetraite(@Valid @RequestBody InscriptionRetraiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inscriptionService.inscrireRetraite(request));
    }

    @PostMapping("/externe")
    @Operation(summary = "Inscription d'un client externe")
    public ResponseEntity<UtilisateurResponse> inscrireExterne(@Valid @RequestBody InscriptionExterneRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inscriptionService.inscrireExterne(request));
    }
}
