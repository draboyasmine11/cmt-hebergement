package com.sonabel.cmt.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PermissionResponse {

    private Long id;
    private String code;
    private String libelle;
    private String description;
    private String module;
    private LocalDateTime createdAt;
}
