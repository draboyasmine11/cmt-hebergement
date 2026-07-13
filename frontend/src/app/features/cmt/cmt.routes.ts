import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@/app/core/guards/auth.guard';

export default [
    { path: 'centres', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./centres/centres').then((m) => m.Centres) },
    { path: 'chambres', canActivate: [roleGuard('ADMIN', 'GERANT')], loadComponent: () => import('./chambres/chambres').then((m) => m.Chambres) },
    { path: 'tarifs', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./tarifs/tarifs').then((m) => m.Tarifs) },
    { path: 'reservations', canActivate: [authGuard], loadComponent: () => import('./reservations/reservations').then((m) => m.Reservations) },
    { path: 'reserver', canActivate: [roleGuard('CLIENT')], loadComponent: () => import('./reserver/reserver').then((m) => m.Reserver) },
    { path: 'utilisateurs', canActivate: [roleGuard('ADMIN', 'GERANT')], loadComponent: () => import('./utilisateurs/utilisateurs').then((m) => m.Utilisateurs) },
    { path: 'roles', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./roles/roles').then((m) => m.Roles) },
    { path: 'parametres', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./parametres/parametres').then((m) => m.Parametres) },
    { path: 'a-propos', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./parametres/parametres').then((m) => m.Parametres) },
    { path: 'signalements', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./signalements/signalements').then((m) => m.Signalements) },
    { path: 'rapports', canActivate: [roleGuard('ADMIN', 'GERANT')], loadComponent: () => import('./rapports/rapports').then((m) => m.Rapports) },
    { path: 'profil', canActivate: [authGuard], loadComponent: () => import('./profil/profil').then((m) => m.Profil) },
    { path: 'demandes-inscription', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./demandes-inscription/demandes-inscription').then((m) => m.DemandesInscription) },

    // Gérant only
    { path: 'occupation', canActivate: [roleGuard('GERANT')], loadComponent: () => import('./occupation/occupation').then((m) => m.Occupation) },
    { path: 'sejours', canActivate: [roleGuard('GERANT')], loadComponent: () => import('./sejours/sejours').then((m) => m.Sejours) },
    { path: 'encaissements', canActivate: [roleGuard('GERANT')], loadComponent: () => import('./encaissements/encaissements').then((m) => m.Encaissements) },
    { path: 'factures', canActivate: [roleGuard('GERANT')], loadComponent: () => import('./factures/factures').then((m) => m.Factures) },

    // Admin + Gérant
    { path: 'paiements', canActivate: [roleGuard('ADMIN', 'GERANT')], loadComponent: () => import('./paiements/paiements').then((m) => m.Paiements) },

    // Client only
    { path: 'mes-sejours', canActivate: [roleGuard('CLIENT')], loadComponent: () => import('./mes-sejours/mes-sejours').then((m) => m.MesSejours) },
    { path: 'mes-factures', canActivate: [roleGuard('CLIENT')], loadComponent: () => import('./mes-factures/mes-factures').then((m) => m.MesFactures) },

    // Tous
    { path: 'notifications', canActivate: [authGuard], loadComponent: () => import('./notifications/notifications').then((m) => m.Notifications) },
    { path: 'aide', canActivate: [authGuard], loadComponent: () => import('./aide/aide').then((m) => m.Aide) }
] as Routes;
