package com.sonabel.cmt.entity;

import com.sonabel.cmt.enums.TypeClient;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "type_client_config")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TypeClientConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 30)
    private TypeClient typeClient;

    @Column(nullable = false, length = 100)
    private String libelle;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal tauxReduction = BigDecimal.ZERO;

    @Column(length = 300)
    private String description;
}
