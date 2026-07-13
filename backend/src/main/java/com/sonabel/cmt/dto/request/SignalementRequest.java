package com.sonabel.cmt.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignalementRequest {

    @NotBlank
    private String sujet;

    @NotBlank
    private String description;
}
