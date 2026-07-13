package com.sonabel.cmt.config;

import com.sonabel.cmt.entity.TypeClientConfig;
import com.sonabel.cmt.enums.TypeClient;
import com.sonabel.cmt.repository.TypeClientConfigRepository;
import com.sonabel.cmt.repository.UtilisateurRepository;
import com.sonabel.cmt.enums.StatutCompte;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Order(1)
@RequiredArgsConstructor
public class TypeClientConfigInitializer implements CommandLineRunner {

    private final TypeClientConfigRepository typeClientConfigRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public void run(String... args) {
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
        utilisateurRepository.findAllActifs().forEach(u -> {
            if (u.getStatutCompte() == null) {
                u.setStatutCompte(StatutCompte.ACTIF);
                utilisateurRepository.save(u);
            }
        });
    }
}
