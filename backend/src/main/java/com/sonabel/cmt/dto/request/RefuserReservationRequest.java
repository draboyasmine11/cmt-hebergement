package com.sonabel.cmt.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefuserReservationRequest {

    @NotBlank(message = "Le motif de refus est obligatoire")
    private String motifRejet;
}
