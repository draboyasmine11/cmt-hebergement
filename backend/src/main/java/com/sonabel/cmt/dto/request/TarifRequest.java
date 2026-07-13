package com.sonabel.cmt.dto.request;

import com.sonabel.cmt.enums.TypeClient;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TarifRequest {

    @NotNull
    private Long centreId;

    @NotNull
    private TypeClient typeClient;

    @NotNull
    @Positive
    private BigDecimal prixParNuit;
}
