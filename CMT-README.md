# CMT SONABEL - Système de gestion des centres d'hébergement

Application web moderne pour la gestion des centres d'hébergement du **Centre Mutuel des Travailleurs (CMT)** de la **SONABEL**.

## Architecture

```
sakai-ng-master/
├── backend/                    # API Spring Boot 3 (Java 21)
│   └── src/main/java/com/sonabel/cmt/
│       ├── controller/         # Couche REST
│       ├── service/            # Logique métier
│       ├── repository/         # Spring Data JPA
│       ├── entity/             # Entités JPA
│       ├── dto/                  # Request / Response
│       ├── security/           # JWT + Spring Security
│       └── config/             # Configuration
└── frontend/                   # Application Angular 21 + Sakai (PrimeNG)
    └── src/app/
        ├── core/               # Auth, guards, services API
        └── features/cmt/       # Modules métier
```

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Backend | Java 21, Spring Boot 3.4, Spring Security, JWT, JPA, MySQL, Lombok, OpenAPI |
| Frontend | Angular 21, Sakai, PrimeNG, PrimeFlex, TailwindCSS, Leaflet, Chart.js |

## Prérequis

- Java 21+
- Maven 3.9+
- Node.js 20+
- MySQL 8+

## Installation

### 1. Base de données

```sql
-- Exécuter le script
mysql -u root -p < backend/src/main/resources/db/schema.sql
```

Ou laisser Hibernate créer les tables (`ddl-auto: update`) — les données de démo sont insérées au démarrage.

### 2. Backend

```powershell
cd backend
# Configurer application.yml (URL MySQL, credentials)
.\mvnw.cmd spring-boot:run
```

> **Note :** Maven n'a pas besoin d'être installé globalement. Le projet inclut le **Maven Wrapper** (`mvnw.cmd`). Au premier lancement, Maven 3.9.11 sera téléchargé automatiquement.

API : `http://localhost:8080/api`  
Swagger : `http://localhost:8080/api/swagger-ui.html`

### 3. Frontend

```bash
cd frontend
npm install
ng serve
```

Application : `http://localhost:4200`

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | admin@sonabel.bf | Admin@2026 |
| Gérant | gerant@sonabel.bf | Admin@2026 |
| Client | client@sonabel.bf | Admin@2026 |

## Modules

- **Authentification JWT** — Connexion email/mot de passe, rôles ADMIN, GERANT, CLIENT
- **Centres** — CRUD, recherche par ville, géolocalisation GPS
- **Chambres** — CRUD, statuts DISPONIBLE/OCCUPEE/MAINTENANCE
- **Réservations** — Création, validation, refus, annulation, anti-chevauchement
- **Paiements** — Encaissement, facture PDF
- **Utilisateurs** — Gestion admin des comptes et rôles
- **Notifications** — Alertes réservations
- **Statistiques** — Dashboard admin avec graphiques
- **Carte Leaflet** — Cartographie des centres, centre le plus proche

## API REST (extrait)

| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | `/auth/login` | Public |
| GET | `/centres` | Public |
| GET | `/chambres/disponibles/{centreId}` | Public |
| POST | `/reservations` | CLIENT |
| PATCH | `/reservations/{id}/valider` | GERANT, ADMIN |
| POST | `/paiements` | GERANT, ADMIN |
| GET | `/statistiques` | ADMIN |

## Évolution microservices

Le code est structuré en modules découplés (auth, centres, réservations, paiements) prêts à être extraits en services indépendants avec API Gateway.
