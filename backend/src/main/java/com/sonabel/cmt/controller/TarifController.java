package com.sonabel.cmt.controller;

import com.sonabel.cmt.dto.request.TarifRequest;
import com.sonabel.cmt.dto.response.TarifResponse;
import com.sonabel.cmt.enums.TypeClient;
import com.sonabel.cmt.service.TarifService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tarifs")
@RequiredArgsConstructor
@Tag(name = "Tarifs", description = "Consultation des tarifs par centre et type de client")
public class TarifController {

    private final TarifService tarifService;

    @GetMapping("/centre/{centreId}")
    public ResponseEntity<List<TarifResponse>> findByCentre(@PathVariable Long centreId) {
        return ResponseEntity.ok(tarifService.findByCentre(centreId));
    }

    @GetMapping("/centre/{centreId}/client/{typeClient}")
    public ResponseEntity<TarifResponse> findByCentreAndTypeClient(
            @PathVariable Long centreId,
            @PathVariable TypeClient typeClient) {
        return ResponseEntity.ok(tarifService.findByCentreAndTypeClient(centreId, typeClient));
    }

    @PostMapping
    public ResponseEntity<TarifResponse> save(@Valid @RequestBody TarifRequest request) {
        return ResponseEntity.ok(tarifService.save(request));
    }
}
