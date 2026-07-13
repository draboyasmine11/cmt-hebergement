package com.sonabel.cmt.service;

import com.sonabel.cmt.enums.TypeClient;
import com.sonabel.cmt.exception.BusinessException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class ReservationServiceTest {

    @Test
    void testValiderDates_invalide() throws Exception {

        ReservationService service = new ReservationService(
                null, null, null, null, null
        );

        LocalDate arrivee = LocalDate.of(2026, 7, 10);
        LocalDate depart = LocalDate.of(2026, 7, 5);

        var method = ReservationService.class
                .getDeclaredMethod("validerDates", LocalDate.class, LocalDate.class);

        method.setAccessible(true);

        Exception ex = assertThrows(Exception.class, () -> {
            method.invoke(service, arrivee, depart);
        });

        assertNotNull(ex);
    }
}