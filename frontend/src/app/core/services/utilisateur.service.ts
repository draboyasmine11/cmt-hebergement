import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Utilisateur, UtilisateurForm } from '../models/cmt.models';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
    private api = inject(ApiService);

    getAll(q?: string) {
        return this.api.get<Utilisateur[]>('/utilisateurs', q ? { q } : undefined);
    }

    getById(id: number) {
        return this.api.get<Utilisateur>(`/utilisateurs/${id}`);
    }

    create(user: UtilisateurForm) {
        return this.api.post<Utilisateur>('/utilisateurs', user);
    }

    update(id: number, user: UtilisateurForm) {
        return this.api.put<Utilisateur>(`/utilisateurs/${id}`, user);
    }

    delete(id: number) {
        return this.api.delete<void>(`/utilisateurs/${id}`);
    }

    activate(id: number) {
        return this.api.patch<Utilisateur>(`/utilisateurs/${id}/activate`, {});
    }

    deactivate(id: number) {
        return this.api.patch<Utilisateur>(`/utilisateurs/${id}/deactivate`, {});
    }

    resetPassword(id: number, genererAleatoire = true, nouveauMotDePasse?: string) {
        return this.api.patch<Utilisateur>(`/utilisateurs/${id}/reset-password`, {
            genererAleatoire,
            nouveauMotDePasse
        });
    }
}
