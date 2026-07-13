package com.sonabel.cmt.dto.response;

import com.sonabel.cmt.enums.TypeNotification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {

    private Long id;
    private TypeNotification typeNotification;
    private String titre;
    private String message;
    private Boolean lu;
    private Long reservationId;
    private LocalDateTime createdAt;
}
