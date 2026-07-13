package com.sonabel.cmt.entity;

import com.sonabel.cmt.enums.TypeClient;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tarifs", uniqueConstraints = @UniqueConstraint(columnNames = {"centre_id", "type_client"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Tarif {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id", nullable = false)
    private Centre centre;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_client", nullable = false, length = 30)
    private TypeClient typeClient;

    @Column(name = "prix_par_nuit", nullable = false, precision = 12, scale = 2)
    private BigDecimal prixParNuit;
}
