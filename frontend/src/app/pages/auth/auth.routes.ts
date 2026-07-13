import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { Register } from './register';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    {
        path: 'inscription',
        loadComponent: () => import('./inscription/choix-profil').then(m => m.ChoixProfil)
    },
    {
        path: 'inscription/agent',
        loadComponent: () => import('./inscription/inscription-agent').then(m => m.InscriptionAgent)
    },
    {
        path: 'inscription/retraite',
        loadComponent: () => import('./inscription/inscription-retraite').then(m => m.InscriptionRetraite)
    },
    {
        path: 'inscription/externe',
        loadComponent: () => import('./inscription/inscription-externe').then(m => m.InscriptionExterne)
    }
] as Routes;
