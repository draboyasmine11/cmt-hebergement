package com.sonabel.cmt.controller;

import com.sonabel.cmt.dto.response.StatistiquesResponse;
import com.sonabel.cmt.service.StatistiquesService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/statistiques")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Statistiques", description = "Tableau de bord administrateur")
public class StatistiquesController {

    private final StatistiquesService statistiquesService;

    @GetMapping
    public ResponseEntity<StatistiquesResponse> getStatistiques() {
        return ResponseEntity.ok(statistiquesService.getStatistiques());
    }
}
