import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';
import { Accueil } from './app/pages/accueil/accueil';
import { authGuard } from './app/core/guards/auth.guard';

export const appRoutes: Routes = [
    { path: 'accueil', component: Accueil },
    { path: 'carte', loadComponent: () => import('./app/features/cmt/carte/carte').then((m) => m.Carte) },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: 'notfound', component: Notfound },
    { path: '', redirectTo: '/accueil', pathMatch: 'full' },
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', canActivate: [authGuard], component: Dashboard },
            { path: 'cmt', canActivate: [authGuard], loadChildren: () => import('./app/features/cmt/cmt.routes') },
            { path: 'pages', canActivate: [authGuard], loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: '**', redirectTo: '/auth/login' }
];
