package com.sonabel.cmt.controller;

import com.sonabel.cmt.dto.response.NotificationResponse;
import com.sonabel.cmt.security.SecurityUtils;
import com.sonabel.cmt.service.NotificationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Notifications", description = "Module de notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> findMine() {
        Long userId = SecurityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(notificationService.findByUtilisateur(userId));
    }

    @GetMapping("/non-lues/count")
    public ResponseEntity<Map<String, Long>> countNonLues() {
        Long userId = SecurityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(Map.of("count", notificationService.countNonLues(userId)));
    }

    @PatchMapping("/{id}/lue")
    public ResponseEntity<Void> marquerLue(@PathVariable Long id) {
        notificationService.marquerCommeLue(id, SecurityUtils.getCurrentUser().getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/toutes-lues")
    public ResponseEntity<Void> marquerToutesLues() {
        notificationService.marquerToutesCommeLues(SecurityUtils.getCurrentUser().getId());
        return ResponseEntity.noContent().build();
    }
}
