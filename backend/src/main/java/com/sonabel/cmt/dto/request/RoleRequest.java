package com.sonabel.cmt.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class RoleRequest {

    private String nom;

    private String description;

    private Boolean actif = true;

    private Set<Long> permissionIds;
}
