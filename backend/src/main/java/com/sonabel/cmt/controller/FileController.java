package com.sonabel.cmt.controller;

import com.sonabel.cmt.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Fichiers", description = "Upload et téléchargement de fichiers")
public class FileController {

    private final FileUploadService fileUploadService;

    @PostMapping("/upload")
    @Operation(summary = "Uploader un fichier justificatif")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        String storedName = fileUploadService.store(file);
        return ResponseEntity.ok(Map.of("filename", storedName));
    }

    @GetMapping("/uploads/{filename:.+}")
    @Operation(summary = "Télécharger un fichier uploadé")
    public ResponseEntity<Resource> download(@PathVariable String filename) {
        try {
            Path filePath = fileUploadService.load(filename);
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            
            String contentType = null;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (Exception ex) {
                // ignore
            }
            
            if (contentType == null) {
                if (filename.toLowerCase().endsWith(".pdf")) {
                    contentType = "application/pdf";
                } else if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (filename.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filename.toLowerCase().endsWith(".doc")) {
                    contentType = "application/msword";
                } else if (filename.toLowerCase().endsWith(".docx")) {
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                } else {
                    contentType = "application/octet-stream";
                }
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
