# Système de Gestion des Centres d'Hébergement de la CMT

Application web de gestion des réservations, des paiements et des centres d'hébergement de la **Caisse Mutuelle des Travailleurs (CMT)** de la **SONABEL**.

---

## Reconnaissance

Ce projet a été développé dans le cadre d'un **stage de fin de cycle** pour l'obtention de la **Licence Professionnelle en MIAGE** à l'**Institut Burkinabè des Arts et Métiers (IBAM)**, Ouagadougou, Burkina Faso.

Le template d'interface utilisateur utilisé est **Sakai NG**, développé par **PrimeTek** et distribué sous licence **MIT**.

Projet officiel :
https://github.com/primefaces/sakai-ng

---

## Technologies utilisées

- Angular 17
- Spring Boot
- MySQL
- PrimeNG
- JSON Web Token (JWT)

Documentation officielle :

- Angular : https://angular.dev
- Spring Boot : https://spring.io/projects/spring-boot
- MySQL : https://www.mysql.com
- PrimeNG : https://primeng.org
- JWT : https://jwt.io

---

## Documentation de l'API

L'API REST est exposée par le backend Spring Boot sur le port **8080** avec le préfixe `/api`.

La documentation interactive est accessible via **Swagger UI** après le démarrage du backend :

```
http://localhost:8080/swagger-ui.html
```

---

# Installation

## Prérequis

Assurez-vous d'avoir installé les outils suivants :

- Java JDK 17 ou supérieur
- Node.js 18 ou supérieur
- npm
- MySQL 8 ou supérieur
- Maven 3.8 ou supérieur
- Angular CLI

Installation d'Angular CLI :

```bash
npm install -g @angular/cli
```

---

## 1. Cloner le projet

```bash
git clone https://github.com/votre-username/cmt-hebergement.git

cd cmt-hebergement
```

---

## 2. Configuration de la base de données

Créer la base de données :

```sql
CREATE DATABASE cmt_db;
```

Configurer le fichier :

```
backend/src/main/resources/application.yml
```

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/cmt_db
    username: votre_username
    password: votre_password

  jpa:
    hibernate:
      ddl-auto: update

jwt:
  secret: votre_cle_secrete_jwt
  expiration: 28800000
```

---

## 3. Démarrer le backend

Depuis le dossier **backend** :

```bash
cd backend

mvn clean install

mvn spring-boot:run
```

Le backend sera disponible à l'adresse :

```
http://localhost:8080
```

Documentation Swagger :

```
http://localhost:8080/swagger-ui.html
```

---

## 4. Démarrer le frontend

Depuis le dossier **frontend** :

```bash
cd frontend

npm install

ng serve
```

Le frontend sera disponible à l'adresse :

```
http://localhost:4200
```

---

## 5. Comptes de test

| Profil | Login | Mot de passe |
|---------|--------|--------------|
| Administrateur | admin@sonabel.bf | Admin@2026 |
| Gérant | ali@gmail.com | 00000000 |
| Client | client@cmt.bf | Client@123 |

---

## Structure du projet

```text
cmt-hebergement/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/sonabel/cmt/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   ├── dto/
│   │   │   │   ├── security/
│   │   │   │   ├── config/
│   │   │   │   ├── exception/
│   │   │   │   └── enums/
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── services/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   └── models/
│   │   │   ├── features/
│   │   │   ├── layout/
│   │   │   └── pages/
│   │   └── environments/
│   ├── package.json
│   └── angular.json
│
└── README.md
```

---

## Licence

Ce projet utilise le template d'interface **Sakai NG**, développé par **PrimeTek** et distribué sous licence **MIT**.

Copyright (c) **2018-2026 PrimeTek**

La licence MIT autorise toute personne à utiliser, copier, modifier, fusionner, publier, distribuer, sous-licencier et vendre des copies du logiciel, sous réserve de conserver la notice de copyright et la licence d'origine.

Le texte complet de la licence est disponible ici :

https://opensource.org/licenses/MIT

Projet Sakai NG :

https://github.com/primefaces/sakai-ng

---

## Auteur

**Développé par :** Mme DRABO Nana Kadidia Yasmine

**Dans le cadre de :** Stage de fin de cycle – Licence Professionnelle MIAGE

**Établissement :** Institut Burkinabè des Arts et Métiers (IBAM)

**Structure d'accueil :** SONABEL – Société Nationale d'Électricité du Burkina Faso

**Maître de stage :** Mr. LOMPO Laurent

**Année académique :** 2025–2026

**Contact :** draboyasmine11@gmail.com

---

© 2026 CMT-SONABEL
