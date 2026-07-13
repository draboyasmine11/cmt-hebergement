package com.sonabel.cmt.dto.response;

import com.sonabel.cmt.enums.TypeClient;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TarifResponse {
    private Long id;
    private Long centreId;
    private String centreNom;
    private String centreVille;
    private TypeClient typeClient;
    private BigDecimal prixParNuit;
}
