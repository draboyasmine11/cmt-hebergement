package com.sonabel.cmt.config;

import com.sonabel.cmt.entity.*;
import com.sonabel.cmt.enums.*;
import com.sonabel.cmt.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Set;

@Component
@Order(2)
@RequiredArgsConstructor
public class DemoDataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final CentreRepository centreRepository;
    private final TypeClientConfigRepository typeClientConfigRepository;
    private final TarifRepository tarifRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) {
        // Initialiser les données de base sans purge
        seedTypeClientConfig();
        fixExistingUsersStatut();

        // Centres
        Centre ouagaPrincipal = centreRepository.findByNom("Centre d'accueil de la Patte d'Oie")
                .orElseGet(() -> centreRepository.findAll().stream()
                        .filter(c -> c.getVille() != null && c.getVille().toUpperCase().contains("OUAGA"))
                        .findFirst()
                        .orElseGet(() -> centreRepository.save(Centre.builder()
                                .nom("Centre d'accueil de la Patte d'Oie")
                                .ville("OUAGADOUGOU").adresse("Patte d'Oie, Ouagadougou")
                                .telephone("+22625306100")
                                .latitude(new BigDecimal("12.3714287"))
                                .longitude(new BigDecimal("-1.5196603"))
                                .description("Centre principal d'hébergement des travailleurs SONABEL à Ouagadougou.")
                                .statut(StatutCentre.ACTIF).build())));

        // Tarifs par centre et par type de client
        for (Centre centre : centreRepository.findAll()) {
            ensureTarif(centre, TypeClient.CLIENT_EXTERNE, new BigDecimal("5000"));
            ensureTarif(centre, TypeClient.AGENT_SONABEL, new BigDecimal("3000"));
            ensureTarif(centre, TypeClient.RETRAITE_SONABEL, new BigDecimal("2500"));
        }

        // Compte admin uniquement
        Role adminRole = roleRepository.findByNom(RoleType.ADMIN).orElseThrow();
        updateOrCreateUser("Admin", "SONABEL", "admin@sonabel.bf", "+22670000001", "ADM001", "Admin@2026", Set.of(adminRole), null);
    }

    private void ensureTarif(Centre centre, TypeClient typeClient, BigDecimal prix) {
        if (tarifRepository.findByCentreIdAndTypeClient(centre.getId(), typeClient).isEmpty()) {
            tarifRepository.save(Tarif.builder()
                .centre(centre).typeClient(typeClient).prixParNuit(prix).build());
        }
    }

    private void seedTypeClientConfig() {
        for (TypeClient tc : TypeClient.values()) {
            if (typeClientConfigRepository.findByTypeClient(tc).isEmpty()) {
                BigDecimal taux = switch (tc) {
                    case AGENT_SONABEL -> new BigDecimal("30");
                    case RETRAITE_SONABEL -> new BigDecimal("40");
                    case CLIENT_EXTERNE -> BigDecimal.ZERO;
                };
                typeClientConfigRepository.save(TypeClientConfig.builder()
                        .typeClient(tc)
                        .libelle(tc.name())
                        .tauxReduction(taux)
                        .build());
            }
        }
    }

    private void fixExistingUsersStatut() {
        utilisateurRepository.findAllActifs().forEach(u -> {
            if (u.getStatutCompte() == null) {
                u.setStatutCompte(StatutCompte.ACTIF);
                utilisateurRepository.save(u);
            }
        });
    }

    private void updateOrCreateUser(String nom, String prenom, String email, String tel, String matricule, String password, Set<Role> roles, Centre centre) {
        Utilisateur user = utilisateurRepository.findByEmail(email).orElse(null);
        String pwd = passwordEncoder.encode(password);
        java.util.Set<Role> mutableRoles = new java.util.HashSet<>(roles);
        if (user == null) {
            user = Utilisateur.builder()
                    .nom(nom).prenom(prenom).email(email)
                    .username(email.split("@")[0])
                    .sexe(com.sonabel.cmt.enums.Sexe.M)
                    .telephone(tel).matricule(matricule)
                    .motDePasse(pwd).actif(true)
                    .statutCompte(StatutCompte.ACTIF)
                    .roles(mutableRoles)
                    .centre(centre)
                    .build();
        } else {
            user.setMotDePasse(pwd);
            user.setRoles(mutableRoles);
            user.setActif(true);
            user.setStatutCompte(StatutCompte.ACTIF);
            if (user.getUsername() == null || user.getUsername().isBlank())
                user.setUsername(email.split("@")[0]);
            if (user.getSexe() == null)
                user.setSexe(com.sonabel.cmt.enums.Sexe.M);
            // Toujours forcer le centre pour le gérant
            if (centre != null)
                user.setCentre(centre);
        }
        utilisateurRepository.save(user);
    }
}
