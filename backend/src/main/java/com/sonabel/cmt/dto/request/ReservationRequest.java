package com.sonabel.cmt.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ReservationRequest {

    @NotNull
    @FutureOrPresent
    private LocalDate dateArrivee;

    @NotNull
    private LocalDate dateDepart;

    @NotNull
    private Long chambreId;
}
