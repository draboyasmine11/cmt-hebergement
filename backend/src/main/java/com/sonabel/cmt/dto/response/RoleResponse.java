package com.sonabel.cmt.dto.response;

import com.sonabel.cmt.enums.RoleType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class RoleResponse {

    private Long id;
    private String nom;
    private String description;
    private Boolean actif;
    private Long nombreUtilisateurs;
    private LocalDateTime createdAt;
    private Set<PermissionResponse> permissions;
}
