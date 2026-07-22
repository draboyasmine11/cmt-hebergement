export type RoleType = 'ADMIN' | 'GERANT' | 'CLIENT';
export type Sexe = 'M' | 'F';
export type TypeClient = 'AGENT_SONABEL' | 'RETRAITE_SONABEL' | 'CLIENT_EXTERNE';
export type StatutCompte = 'EN_ATTENTE' | 'ACTIF' | 'REJETE';
export type TypePieceIdentite = 'CNI' | 'PASSEPORT' | 'CARTE_CONSULAIRE' | 'AUTRE';
export type NiveauAcces = 'STANDARD' | 'AVANCE' | 'COMPLET';
export type StatutChambre = 'DISPONIBLE' | 'OCCUPEE' | 'MAINTENANCE';
export type StatutReservation = 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE' | 'ANNULEE';
export type StatutCentre = 'ACTIF' | 'INACTIF';
export type ModePaiement = 'ESPECES' | 'CHEQUE' | 'MOBILE_MONEY' | 'ORANGE_MONEY' | 'MOOV_MONEY' | 'WAVE' | 'CORIS_MONEY' | 'TELECEL_MONEY';
export type TypeNotification = 'NOUVELLE_RESERVATION' | 'RESERVATION_VALIDEE' | 'RESERVATION_REFUSEE' | 'RESERVATION_ANNULEE' | 'RAPPEL_SEJOUR' | 'COMPTE_APPROUVE' | 'COMPTE_REJETE' | 'NOUVELLE_DEMANDE_INSCRIPTION';

export interface AuthResponse {
    token: string;
    type: string;
    id: number;
    nom: string;
    prenom: string;
    email: string;
    roles: RoleType[];
    centreId?: number;
    matricule?: string;
    statutCompte?: StatutCompte;
    typeClient?: TypeClient;
    tauxReduction?: number;
    motifRejet?: string;
}

export interface Utilisateur {
    id: number;
    nom: string;
    prenom: string;
    sexe?: Sexe;
    email: string;
    username?: string;
    telephone?: string;
    adresse?: string;
    photoUrl?: string;
    matricule?: string;
    fonction?: string;
    niveauAcces?: NiveauAcces;
    typeClient?: TypeClient;
    statutCompte?: StatutCompte;
    dateNaissance?: string;
    dateDepartRetraite?: string;
    tauxReduction?: number;
    motifRejet?: string;
    fichierJustificatif?: string;
    direction?: string;
    service?: string;
    typePiece?: TypePieceIdentite;
    numeroPiece?: string;
    nationalite?: string;
    profession?: string;
    actif: boolean;
    centreId?: number;
    centreNom?: string;
    roles: RoleType[];
    typeUtilisateur?: RoleType;
    createdAt?: string;
    motDePasseTemporaire?: string;
}

export interface UtilisateurForm extends Partial<Utilisateur> {
    typeUtilisateur?: RoleType;
    motDePasse?: string;
    confirmationMotDePasse?: string;
    genererMotDePasse?: boolean;
}

export interface Centre {
    id: number;
    nom: string;
    ville: string;
    adresse: string;
    telephone?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    image?: string;
    statut: StatutCentre;
    nombreChambres?: number;
    chambresDisponibles?: number;
    distanceKm?: number;
    gerantId?: number;
    gerantNom?: string;
    gerantTelephone?: string;
}

export interface Chambre {
    id: number;
    numero: string;
    image?: string;
    prixParNuit: number;
    statut: StatutChambre;
    centreId: number;
    centreNom?: string;
    centreVille?: string;
    disponible?: boolean;
    clientNom?: string;
    dateArrivee?: string;
    dateDepart?: string;
}

export interface Reservation {
    id: number;
    dateReservation: string;
    dateArrivee: string;
    dateDepart: string;
    dateSortieReelle?: string;
    statut: StatutReservation;
    montantTotal?: number;
    utilisateurId: number;
    utilisateurNom?: string;
    chambreId: number;
    chambreNumero?: string;
    chambreType?: string;
    centreId?: number;
    centreNom?: string;
    payee?: boolean;
    motifRejet?: string;
}

export interface Paiement {
    id: number;
    montant: number;
    datePaiement: string;
    modePaiement: ModePaiement;
    reference?: string;
    reservationId: number;
    clientNom?: string;
    gerantNom?: string;
    chambreNumero?: string;
    chambreType?: string;
    dateSortieReelle?: string;
}

export interface Tarif {
    id: number;
    centreId: number;
    centreNom?: string;
    centreVille?: string;
    typeClient: TypeClient;
    prixParNuit: number;
}

export interface Notification {
    id: number;
    typeNotification: TypeNotification;
    titre: string;
    message: string;
    lu: boolean;
    reservationId?: number;
    createdAt: string;
}

export interface Statistiques {
    totalCentres: number;
    totalChambres: number;
    chambresDisponibles: number;
    chambresOccupees: number;
    reservationsMois: number;
    totalReservations: number;
    totalUtilisateurs: number;
    tauxOccupation: number;
    revenusGeneres: number;
    reservationsParMois: { mois: number; annee: number; total: number }[];
    revenusMensuels: { mois: number; annee: number; montant: number }[];
    tauxOccupationMensuel: unknown[];
    reservationsParCentre: { nom: string; total: number }[];
    revenusParCentre: { nom: string; montant: number }[];
}

export interface Permission {
    id: number;
    code: string;
    libelle: string;
    description?: string;
    module: string;
    createdAt?: string;
}

export interface Role {
    id: number;
    nom: string;
    description?: string;
    actif: boolean;
    nombreUtilisateurs: number;
    createdAt?: string;
    permissions: Permission[];
}

export interface RoleForm {
    nom?: string;
    description?: string;
    actif?: boolean;
    permissionIds?: number[];
}

export interface DemandeInscription {
    id: number;
    nom: string;
    prenom: string;
    sexe?: Sexe;
    dateNaissance?: string;
    email: string;
    telephone?: string;
    adresse?: string;
    matricule?: string;
    direction?: string;
    service?: string;
    fonction?: string;
    dateDepartRetraite?: string;
    typeClient: TypeClient;
    statutCompte: StatutCompte;
    typePiece?: string;
    numeroPiece?: string;
    username?: string;
    fichierJustificatif?: string;
    motifRejet?: string;
    tauxReduction?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface InscriptionAgentRequest {
    nom: string;
    prenom: string;
    sexe: string;
    dateNaissance?: string;
    telephone: string;
    email: string;
    matricule: string;
    username?: string;
    motDePasse: string;
    fichierJustificatif?: string;
}

export interface InscriptionRetraiteRequest {
    nom: string;
    prenom: string;
    sexe: string;
    dateNaissance?: string;
    telephone: string;
    email: string;
    matricule: string;
    dateDepartRetraite?: string;
    username?: string;
    motDePasse: string;
    fichierJustificatif?: string;
}

export interface InscriptionExterneRequest {
    nom: string;
    prenom: string;
    sexe: string;
    dateNaissance?: string;
    telephone: string;
    email: string;
    adresse: string;
    typePiece: string;
    numeroPiece: string;
    dateEmissionCnib?: string;
    username?: string;
    motDePasse: string;
    fichierJustificatif?: string;
}
