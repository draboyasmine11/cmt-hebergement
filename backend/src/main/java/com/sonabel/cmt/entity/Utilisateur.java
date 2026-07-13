package com.sonabel.cmt.entity;

import com.sonabel.cmt.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "utilisateurs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Enumerated(EnumType.STRING)
    @Column(length = 1)
    private Sexe sexe;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 100)
    private String username;

    @Column(length = 20)
    private String telephone;

    @Column(length = 500)
    private String adresse;

    @Column(columnDefinition = "LONGTEXT")
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private StatutCompte statutCompte = StatutCompte.ACTIF;

    @Column(length = 500)
    private String fichierJustificatif;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "date_depart_retraite")
    private LocalDate dateDepartRetraite;

    @Column(name = "taux_reduction")
    private BigDecimal tauxReduction;

    @Column(columnDefinition = "TEXT")
    private String motifRejet;

    @Column(length = 50)
    private String matricule;

    @Column(length = 150)
    private String fonction;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private NiveauAcces niveauAcces;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private TypeClient typeClient;

    @Column(length = 150)
    private String direction;

    @Column(length = 150)
    private String service;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private TypePieceIdentite typePiece;

    @Column(length = 100)
    private String numeroPiece;

    @Column(length = 100)
    private String nationalite;

    @Column(length = 150)
    private String profession;

    @Column(name = "mot_de_passe", nullable = false)
    private String motDePasse;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id")
    private Centre centre;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "utilisateur_roles",
            joinColumns = @JoinColumn(name = "utilisateur_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "utilisateur")
    @Builder.Default
    private Set<Reservation> reservations = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
